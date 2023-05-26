import { connectToDb } from "@/lib/mongoose";
import ChatThread from "@/db/ChatThread";
import { getOpenai } from "@/lib/openai";
import { maxRefineCount } from "@/lib/constants";
import Creation from "@/db/Creation";
import { getEmbedding, cosineSimilarity } from "@/utils/embedding";

const systemPrompt = `
Given the following list of shapes, return an array that resembles the target object:
Cube, Ball, Cylinder, Cone, Triangle Pyramid, Square Pyramid, Donut

Initial direction of shapes without rotation:
- Cylinder is standing up
- Cone, Triangle Pyramid, and Square Pyramid are upside down

Return the result using the format below:
[{name: "Ring", shape: "Donut", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}}]

Rotation are specified in radians
Use the exact shape names given
If prompt is unrelated to the object, return "Unrelated"
`;

function generatePrompt(model) {
  return `Object: ${model}.`;
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
  const creationDescription = req.body.creationDescription || "";
  if (creationDescription.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a model description.",
      },
    });
    return;
  }

  const examples = await getRelevantExamples(creationDescription);

  const messages = [{ role: "system", content: systemPrompt }].concat(
    examples
      .map(({ example }) => [
        { role: "user", content: generatePrompt(example.title) },
        { role: "assistant", content: example.content },
      ])
      .flat()
  );
  console.log(messages);
  messages.push({ role: "user", content: generatePrompt(creationDescription) });

  try {
    const { openai } = getOpenai();
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: messages,
    });
    console.log(completion.data);
    const result = completion.data.choices[0].message;
    messages.push(result);
    await connectToDb();
    const thread = await ChatThread.create({
      title: creationDescription,
      messages: messages,
      exampleCount: examples.length,
      refineCount: 0,
    });
    res.status(200).json({
      result: result,
      threadId: thread._id,
      refinesLeft: maxRefineCount - thread.refineCount,
    });
  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
}
