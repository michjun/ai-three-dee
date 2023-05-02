import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

  const modelDescription = req.body.modelDescription || "";
  if (modelDescription.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a model description.",
      },
    });
    return;
  }

  const prompt = generatePrompt(modelDescription);
  console.log(prompt);
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    res.status(200).json({ result: completion.data.choices[0].message });
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
Return an array of shapes that roughly resembles ${model} using the shapes. Return only the result without any explanation text.
  
  Example Result for "Car":
  [
    {shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 4.5, y: 1, z: 1.5}, name: "Body"},
    {shape: "Cube", position: {x: 0, y: 0.8, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 2.5, y: 0.8, z: 1}, name: "Top"},
    {shape: "Ball", position: {x: -1.25, y: -1.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Front Left Wheel"},
    {shape: "Ball", position: {x: -1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Front Right Wheel"},
    {shape: "Ball", position: {x: 1.25, y: -0.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Back Left Wheel"},
    {shape: "Ball", position: {x: 1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Back Right Wheel"}
  ]`;
}

function generatePrompt(model) {
  return `
  Available shapes:
  - Cube
  - Ball
  - Cylinder
  - Circular Cone
  - Triangle Pyramid
  - Square Pyramid
  - Donut
  
  Without rotation, Cylinder is standing up; Circular Cone, Triangle Pyramid, and Square Pyramid have the tips at the bottom, and the Donut's hole is on the xy-plane.
  Rotation are specified in radians.
  Return an array of shapes that roughly resembles ${model} using the shapes. Return only the result without any explanation text.
  
  Example
  Result for "UFO":
  [
    {shape: "Donut", position: {x: 0, y: 0, z: 0}, rotation: {x: 1.5708, y: 0, z: 0}, scale: {x: 2, y: 2, z: 1.5}, name: "Ring"},
    {shape: "Ball", position: {x: 0, y: 0.45, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1.8, y: 1, z: 1.8}, name: "Top"},
    {shape: "Ball", position: {x: 0, y: -0.45, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1.8, y: 1, z: 1.8}, name: "Bottom"}
  ]
  Result for "House":
  [
    {shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 2, y: 1, z: 1.5}, name: "Base"},
    {shape: "Square Pyramid", position: {x: 0, y: 1, z: 0}, rotation: {x: 3.14, y: 0.785
    , z: 0}, scale: {x: 1.6, y: 1.2, z: 1.6}, name: "Roof"}
  ]
  Result for "Car":
  [
    {shape: "Cube", position: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 4.5, y: 1, z: 1.5}, name: "Body"},
    {shape: "Cube", position: {x: 0, y: 0.8, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 2.5, y: 0.8, z: 1}, name: "Top"},
    {shape: "Cylinder", position: {x: -1.25, y: -1.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Front Left Wheel"},
    {shape: "Cylinder", position: {x: -1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Front Right Wheel"},
    {shape: "Cylinder", position: {x: 1.25, y: -0.5, z: 0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Back Left Wheel"},
    {shape: "Cylinder", position: {x: 1.25, y: -0.5, z: -0.75}, rotation: {x: 1.58, y: 0, z: 0}, scale: {x: 0.5, y: 0.5, z: 0.5}, name: "Back Right Wheel"}
  ]
  `;
}
