import { connectToDb } from "@/lib/mongoose";
import ChatThread from "@/db/ChatThread";
import { getOpenAI } from "@/lib/openai";
import { maxRefineCount } from "@/lib/constants";
import Creation from "@/db/Creation";
import { getEmbedding, cosineSimilarity } from "@/utils/embedding";
import { fewShotModes, staticFewShotModeNames } from "@/lib/constants";

const systemPrompt = `
Construct an array representing an object using the list of shapes:
[Cube, Ball, Cylinder, Cone, Square Pyramid, Donut]

Breakdown the object into parts, and identify the best shape for each part.
Define the position, rotation, scale, and color of each part, relative to the other parts.

When setting rotation, consider the original directions of the shapes:
- Cylinder is standing upright
- The tip of Cone points downwards
- The tip of Square Pyramid points downwards
- The hole of the Donut is parallel to the xy plane

Generate your response in this format:
[{name: ShapeName", shape: "GivenShape", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}, color: {r: 100, g: 100, b: 255}}]

Please note the following:
- Express rotation values in radians and provide them as pure numbers, excluding any arithmetic operations
- Use only the provided shape names from the list
- If the prompt object does not have a physical shape, return "Unrelated"
- Try to be a little creative, but don't worry too much about it
- For color, you can add an optional "a" attribute for transparency, from 0 to 255. If not provided, the default is 255.
`;

const chainOfThoughtPrompt = `
A house consists of a base, roof, and chimney. 
Base (Cube) requires no rotation / translation {x: 0, y: 0, z: 0}, scale to a rectangular form {x: 2, y: 1, z: 1.5}.
Roof (Square Pyramid) is positioned on top of the base at {x: 0, y: 1, z: 0}, rotate on x axis to point the pyramid's tip upwards and on y axis to align the roof with the base {x: 3.14, y: 0.785, z: 0}, scale for sufficient width and modest height {x: 1.6, y: 1.2, z: 1.6}.
Chimney (Cylinder) is positioned atop the roof at {x: 0.7, y: 1.2, z: 0}, for upright cylinder keep rotation as {x: 0, y: 0, z: 0}, scale to long and skinny {x: 0.2, y: 0.8, z: 0.2}.

Final Result:
[
{name: "Base", shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 2, y: 1, z: 1.5}},
{name: "Roof", shape: "Square Pyramid", position: {x: 0, y: 1, z: 0}, rotation: {x: 3.14, y: 0.785, z: 0}, scale: {x: 1.6, y: 1.2, z: 1.6}},
{name: "Chimney", shape: "Cylinder", position: {x: 0.7, y: 1.2, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.2, y: 0.8, z: 0.2}}
]
`;

async function generatePrompt(model) {
  const modeKeys = Object.keys(fewShotModes);
  const fewShotMode =
    process.env.FEW_SHOT_MODE ||
    // If a mode is not set, use a random mode except for chainOfThoughtMode
    // since right now chainOfThoughtMode is producing crap
    fewShotModes[modeKeys[((modeKeys.length - 1) * Math.random()) << 0]];
  const examples = await getExamples(model, fewShotMode);
  const messages = [{ role: "system", content: systemPrompt }].concat(
    examples
      .map((example) => [
        { role: "user", content: `Object: ${example.title}` },
        { role: "assistant", content: example.content },
      ])
      .flat()
  );
  if (fewShotMode === fewShotModes.chainOfThoughtMode) {
    messages.push({ role: "user", content: `Object: House` });
    messages.push({ role: "assistant", content: chainOfThoughtPrompt });
  }
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

async function getExamples(creationDescription, fewShotMode) {
  if (fewShotMode === fewShotModes.staticMode) {
    return await getStaticExamples();
  } else if (fewShotMode === fewShotModes.dynamicMode) {
    return await getRelevantExamples(creationDescription);
  } else {
    return [];
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
        model: "gpt-4-0613",
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
            console.log(fullResults);
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
