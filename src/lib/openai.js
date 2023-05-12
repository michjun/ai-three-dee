import { Configuration, OpenAIApi } from "openai";

let configuration, openai;

export function getOpenai() {
  if (!configuration || !openai) {
    configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
  }
  return { configuration, openai };
}
