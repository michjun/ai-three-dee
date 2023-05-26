import { getOpenai } from "@/lib/openai";

function dotProduct(v1, v2) {
  let product = 0;
  for (let i = 0; i < v1.length; i++) {
    product += v1[i] * v2[i];
  }
  return product;
}

function magnitude(v) {
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return Math.sqrt(sum);
}

export function cosineSimilarity(v1, v2) {
  return dotProduct(v1, v2) / (magnitude(v1) * magnitude(v2));
}

export async function getEmbedding(content) {
  const { openai } = getOpenai();
  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: content,
  });
  return response.data.data[0].embedding;
}
