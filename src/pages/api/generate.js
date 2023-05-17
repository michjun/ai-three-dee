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
  {
    prompt: "Dog",
    response: `[
{name: "Body", shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 0.6, z: 2}},
{name: "Head", shape: "Cube", position: {x: 0, y: 0.6, z: 0.9}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.8, y: 0.8, z: 0.8}},
{name: "Snout", shape: "Cube", position: {x: 0, y: 0.6, z: 1.4}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.4, y: 0.4, z: 0.6}},
{name: "Front Left Leg", shape: "Cube", position: {x: 0.4, y: -0.5, z: 0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Back Left Leg", shape: "Cube", position: {x: 0.4, y: -0.5, z: -0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Front Right Leg", shape: "Cube", position: {x: -0.4, y: -0.5, z: 0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Back Right Leg", shape: "Cube", position: {x: -0.4, y: -0.5, z: -0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Tail", shape: "Cube", position: {x: 0, y: 0.5, z: -1.3}, rotation: {x: 0.8, y: 0, z: 0}, scale: {x: 0.2, y: 1, z: 0.2}},
{name: "Left Ear", shape: "Cube", position: {x: 0.4, y: 1.15, z: 1}, rotation: {x: 3.14, y: 0.3, z: -0.3}, scale: {x: 0.3, y: 0.4, z: 0.1}},
{name: "Right Ear", shape: "Cube", position: {x: -0.4, y: 1.15, z: 1}, rotation: {x: 3.14, y: -0.3, z: 0.3}, scale: {x: 0.3, y: 0.4, z: 0.1}},
]`,
  },
  {
    prompt: "Bear",
    response: `[
{name: "Body", shape: "Ball", position: {x: 0, y: 0, z: -0.09}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 0.8, z: 1.4}},
{name: "Head", shape: "Ball", position: {x: 0, y: 0.6, z: 0.9}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.8, y: 0.8, z: 0.8}},
{name: "Snout", shape: "Ball", position: {x: 0, y: 0.6, z: 1.4}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.4, y: 0.4, z: 0.6}},
{name: "Front Left Leg", shape: "Cylinder", position: {x: 0.4, y: -0.5, z: 0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Back Left Leg", shape: "Cylinder", position: {x: 0.4, y: -0.5, z: -0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Front Right Leg", shape: "Cylinder", position: {x: -0.4, y: -0.5, z: 0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Back Right Leg", shape: "Cylinder", position: {x: -0.4, y: -0.5, z: -0.8}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.3, y: 1, z: 0.3}},
{name: "Tail", shape: "Ball", position: {x: 0, y: 0.5, z: -1.3}, rotation: {x: 0.8, y: 0, z: 0}, scale: {x: 0.2, y: 0.3, z: 0.2}},
{name: "Left Ear", shape: "Ball", position: {x: 0.4, y: 1.15, z: 1}, rotation: {x: 3.14, y: 0.3, z: -0.3}, scale: {x: 0.3, y: 0.4, z: 0.1}},
{name: "Right Ear", shape: "Ball", position: {x: -0.4, y: 1.15, z: 1}, rotation: {x: 3.14, y: -0.3, z: 0.3}, scale: {x: 0.3, y: 0.4, z: 0.1}},
]`,
  },
  {
    prompt: "Sunflower",
    response: `[
{name: "Stem", shape: "Cylinder", position: {x: 0, y: -1.5, z: -0.55}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 0.1, y: 5.5, z: 0.1}},
{name: "Disk", shape: "Cylinder", position: {x: 0, y: 1, z: 0}, rotation: {x: 1.5708, y: 0, z: 0}, scale: {x: 1, y: 0.2, z: 1}},
{name: "Heart", shape: "Ball", position: {x: 0, y: 1, z: -0.1}, rotation: {x: 1.5708, y: 0, z: 0}, scale: {x: 0.7, y: 0.5, z: 0.7}},
{name: "Petal1", shape: "Ball", position: {x: 0, y: 2.5, z: 0.1}, rotation: {x: -0.3, y: 0, z: 0}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Petal2", shape: "Ball", position: {x: 0, y: -0.5, z: 0.1}, rotation: {x: 0.3, y: 0, z: 0}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Petal3", shape: "Ball", position: {x: 1.5, y: 1, z: 0.1}, rotation: {x: 0, y: -0.3, z: 1.57}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Petal4", shape: "Ball", position: {x: -1.5, y: 1, z: 0.1}, rotation: {x: 0, y: 0.3, z: 1.57}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Petal5", shape: "Ball", position: {x: 1, y: 2, z: 0.1}, rotation: {x: -0.3, y: 0, z: 0.785}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Petal6", shape: "Ball", position: {x: -1, y: 2, z: 0.1}, rotation: {x: -0.3, y: 0, z: -0.785}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Petal7", shape: "Ball", position: {x: 1, y: 0, z: 0.1}, rotation: {x: 0.3, y: 0, z: -0.785}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Petal8", shape: "Ball", position: {x: -1, y: 0, z: 0.1}, rotation: {x: 0.3, y: 0, z: 0.785}, scale: {x: 0.3, y: 0.6, z: 0.2}},
{name: "Leaf1", shape: "Ball", position: {x: -0.6, y: -1.4, z: -0.5}, rotation: {x: 0, y: 0, z: -0.785}, scale: {x: 0.3, y: 0.9, z: 0.1}},
{name: "Leaf2", shape: "Ball", position: {x: 0.6, y: -2.2, z: -0.5}, rotation: {x: 0, y: 0, z: 0.785}, scale: {x: 0.3, y: 0.9, z: 0.1}}
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
