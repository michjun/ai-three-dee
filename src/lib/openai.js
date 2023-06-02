import { Configuration, OpenAIApi } from "openai";

let configuration, openAI;

export function getOpenAI() {
  if (!configuration || !openAI) {
    configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openAI = new OpenAIApi(configuration);
  }
  return { configuration, openAI };
}
