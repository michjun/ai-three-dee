import { connectToDb } from "@/lib/mongoose";
import ChatThread from "@/db/ChatThread";
import { getOpenAI } from "@/lib/openai";
import { maxRefineCount } from "@/lib/constants";
import Creation from "@/db/Creation";
import { getEmbedding, cosineSimilarity } from "@/utils/embedding";

const systemPrompt = `
Given the following list of shapes, return an array that resembles the target object:
Cube, Ball, Cylinder, Cone, Square Pyramid, Donut

Initial direction of shapes without rotation:
- Cylinder is standing up
- Cone and Square Pyramid has the tip pointing down

Return the result using the format below:
[{name: "Ring", shape: "Donut", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}}]

Rotation are specified in radians, use pure numbers without arithmetic operations.
Use the exact shape names given
If prompt is not something that is render-able, return "Unrelated"
`;

async function generatePrompt(model) {
  const examples = await getRelevantExamples(model);
  const messages = [{ role: "system", content: systemPrompt }].concat(
    examples
      .map(({ example }) => [
        { role: "user", content: `Object: ${example.title}` },
        { role: "assistant", content: example.content },
      ])
      .flat()
  );
  messages.push({ role: "user", content: `Object: ${model}` });
  return { messages, examples };
}

async function getRelevantExamples(creationDescription) {
  const creationEmbedding = await getEmbedding(creationDescription);
  await connectToDb();
  const examples = await Creation.find({ useAsExample: true });
  const relevantExamples = examples
    .map((example) => ({
      similarity: cosineSimilarity(example.embedding, creationEmbedding),
      example: example,
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Hardcoded to 3 examples for now, todo: make this dynamic based on token count
  return relevantExamples;
}

export default async function (req, res) {
  try {
    const creationDescription = decodeURIComponent(req.query.model || "");
    if (creationDescription.trim().length === 0) {
      throw new Error("Invalid input");
    }

    const { messages, examples } = await generatePrompt(creationDescription);
    console.log(messages);

    const { openAI } = getOpenAI();
    const { data } = await openAI.createChatCompletion(
      {
        model: "gpt-4",
        messages: messages,
        stream: true,
      },
      { responseType: "stream" }
    );
    res.writeHead(200, {
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    });
    let fullResults = "";
    // Process streaming chatGPT response.
    data.on("data", async (text) => {
      try {
        const lines = text
          .toString()
          .split("\n")
          .filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            // End of openAI completion, store results in DB
            messages.push({ role: "assistant", content: fullResults });
            await connectToDb();
            const thread = await ChatThread.create({
              title: creationDescription,
              messages: messages,
              exampleCount: examples.length,
              refineCount: 0,
            });
            const endingData = {
              threadId: thread._id,
              refinesLeft: maxRefineCount - thread.refineCount,
            };
            res.write(`data: [DONE]\n\n`);
            res.write(`data: ${JSON.stringify(endingData)}\n\n`);
            res.end();
            return;
          }
          const { choices } = JSON.parse(message);
          const newTokens = choices[0].delta.content;
          if (newTokens) {
            fullResults += newTokens;
            res.write(`data: ${JSON.stringify({ tokens: newTokens })}\n\n`);
            res.flush();
          }
          if (fullResults === "Unrelated") {
            throw new Error("Unrelated");
          }
        }
      } catch (error) {
        console.error(`Error with stream response: ${error.message}`);
        res.write(`data: [ERROR]\n\n`);
        res.end();
      }
    });

    data.on("error", (error) => {
      console.error(`Stream Error: ${error.message}`);
      res.write(`data: [ERROR]\n\n`);
      res.end();
    });
  } catch (error) {
    console.error(`Error with Generate Endpoint: ${error.message}`);
    res.write(`data: [ERROR]\n\n`);
    res.end();
  }
}
