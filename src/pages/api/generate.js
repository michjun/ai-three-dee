import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
`;

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
  return `Return results for object: ${model}.`;
}

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const creationDescription = req.body.creationDescription || "";
  if (creationDescription.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a model description.",
      },
    });
    return;
  }

  const messages = [{ role: "system", content: systemPrompt }]
    .concat(
      examples
        .map((example) => [
          { role: "user", content: generatePrompt(example.prompt) },
          { role: "assistant", content: example.response },
        ])
        .flat()
    )
    .concat([{ role: "user", content: generatePrompt(creationDescription) }]);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: messages,
    });
    console.log(completion.data);
    const result = completion.data.choices[0].message;
    res.status(200).json({ result: result });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generateSimplePrompt(model) {
  return `
Available shapes:
- Cube
- Ball
  
Rotation are specified in radians.
Return an array of shapes that roughly resembles ${model} using the shapes. 
Return the result array without any extra text. 
  
Example Result for "Car":
[
  {shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 4.5, y: 1, z: 1.5}, name: "Body"},
  {shape: "Cube", position: {x: 0, y: 0.8, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 2.5, y: 0.8, z: 1}, name: "Top"},
  {shape: "Ball", position: {x: -1.25, y: -0.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Front Left Wheel"},
  {shape: "Ball", position: {x: -1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Front Right Wheel"},
  {shape: "Ball", position: {x: 1.25, y: -0.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Back Left Wheel"},
  {shape: "Ball", position: {x: 1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Back Right Wheel"}
]`;
}
