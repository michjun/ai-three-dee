import { creationContentToJson } from "@/utils/json";
export default class CreationData {
  constructor(
    title = null,
    content = null,
    threadId = null,
    refinesLeft = 0,
    id = null,
    example = false
  ) {
    this.title = title;
    this.content = content;
    this.threadId = threadId;
    this.refinesLeft = refinesLeft;
    this.id = id;
    this.example = example;
  }

  contentToJson() {
    return creationContentToJson(this.content);
  }

  validate() {
    let errors = [];
    if (!this.title) {
      errors.push("Please enter a title for your creation.");
    }
    if (!this.content) {
      errors.push("Please generate a 3d model creation first.");
    }
    return { errors };
  }
}
