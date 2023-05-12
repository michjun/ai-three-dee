import { connectToDb } from "@/lib/mongoose";
import ChatThread from "@/db/ChatThread";
import { getOpenai } from "@/lib/openai";
import { maxRefineCount } from "@/lib/constants";

const systemPrompt = `
Given the following list of shapes, return an array of shapes that resembles the target object.

Available shapes:
Cube, Ball, Cylinder, Cone, Triangle Pyramid, Square Pyramid, Donut

Initial direction of shapes without rotation:
- Cylinder is standing up
- Cone, Triangle Pyramid, and Square Pyramid are upside down
- Donut's hole is on the xy-plane.

Return only the result using the format below, do not include any extra text:
[{name: "Ring", shape: "Donut", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}}]

Rotation are specified in radians.
Use the exact shape names above.
If user prompt is unrelated to the target object, return the previous array.
`;

// TODO: store examples in database
const examples = [
  {
    prompt: "UFO",
    response: `[
{name: "Ring", shape: "Donut", position: {x: 0, y: 0, z: 0}, rotation: {x: 1.5708, y: 0, z: 0}, scale: {x: 2, y: 2, z: 1.5}},
{name: "Top", shape: "Ball", position: {x: 0, y: 0.45, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1.8, y: 1, z: 1.8}},
{name: "Bottom", shape: "Ball", position: {x: 0, y: -0.45, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1.8, y: 1, z: 1.8}}
]`,
  },
  {
    prompt: "House",
    response: `[
{name: "Base", shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 2, y: 1, z: 1.5}},
{name: "Roof", shape: "Square Pyramid", position: {x: 0, y: 1, z: 0}, rotation: {x: 3.14, y: 0.785, z: 0}, scale: {x: 1.6, y: 1.2, z: 1.6}}
]`,
  },
  {
    prompt: "Car",
    response: `[
{name: "Body", shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 4.5, y: 1, z: 1.5}},
{name: "Top", shape: "Cube", position: {x: 0, y: 0.8, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 2.5, y: 0.8, z: 1}},
{name: "Front Left Wheel", shape: "Cylinder", position: {x: -1.25, y: -0.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}},
{name: "Front Right Wheel", shape: "Cylinder", position: {x: -1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}},
{name: "Back Left Wheel", shape: "Cylinder", position: {x: 1.25, y: -0.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}},
{name: "Back Right Wheel", shape: "Cylinder", position: {x: 1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}}
]`,
  },
];

function generatePrompt(model) {
  return `Return result for object: ${model}.`;
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

  const messages = [{ role: "system", content: systemPrompt }].concat(
    examples
      .map((example) => [
        { role: "user", content: generatePrompt(example.prompt) },
        { role: "assistant", content: example.response },
      ])
      .flat()
  );
  messages.push({ role: "user", content: generatePrompt(creationDescription) });

  try {
    const { openai } = getOpenai();
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: messages,
    });
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
