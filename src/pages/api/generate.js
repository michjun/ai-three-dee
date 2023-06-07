import { connectToDb } from "@/lib/mongoose";
import ChatThread from "@/db/ChatThread";
import { getOpenAI } from "@/lib/openai";
import { maxRefineCount } from "@/lib/constants";
import Creation from "@/db/Creation";
import { getEmbedding, cosineSimilarity } from "@/utils/embedding";
import { fewShotModes, staticFewShotModeNames } from "@/lib/constants";

const systemPrompt = `
Construct an array representing a target object using the following list of shapes:
[Cube, Ball, Cylinder, Cone, Square Pyramid, Donut]

Breakdown the object into parts, and identify the best shape for each part.
Define the position, rotation, and scale of each part, relative to the other parts.

When setting rotation, consider the original orientations of the shapes:
- Cylinder is vertically upright
- The tip of Cone points downwards
- The tip of Square Pyramid points downwards
- The hole of the Donut is parallel to the xy plane

Generate your response in this format:
[{name: ShapeName", shape: "GivenShape", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}}]

Please note the following:
- Express rotation values in radians and provide them as pure numbers, excluding any arithmetic operations
- Use only the provided shape names from the list
- If the prompt object does not have a physical shape, return "Unrelated"
`;

async function generatePrompt(model) {
  const examples = await getExamples(model);
  const messages = [{ role: "system", content: systemPrompt }].concat(
    examples
      .map((example) => [
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
    .sort((a, b) => a.similarity - b.similarity)
    .slice(-2); // Hardcoded to 2 examples for now, todo: make this dynamic based on token count
  return relevantExamples.map(({ example }) => example);
}

async function getStaticExamples() {
  await connectToDb();
  const examples = await Creation.find({
    useAsExample: true,
    title: { $in: staticFewShotModeNames },
  });
  return examples;
}

async function getExamples(creationDescription) {
  const modeKeys = Object.keys(fewShotModes);
  const fewShotMode =
    process.env.FEW_SHOT_MODE ||
    fewShotModes[modeKeys[(modeKeys.length * Math.random()) << 0]];
  if (fewShotMode === fewShotModes.noShotMode) {
    return [];
  } else if (fewShotMode === fewShotModes.staticMode) {
    return await getStaticExamples();
  } else {
    return await getRelevantExamples(creationDescription);
  }
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
