export function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function creationContentToJson(content) {
  return content?.replace(/(\w+)\s*:/g, '"$1":')?.replace(/},\s*]/g, "}]");
}
