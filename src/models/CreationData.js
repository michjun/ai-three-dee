import { creationContentToJson } from "@/utils/json";
export default class CreationData {
  constructor({
    title = null,
    content = null,
    threadId = null,
    refinesLeft = 0,
    _id = null,
    useAsExample = false,
  }) {
    this.title = title;
    this.content = content;
    this.threadId = threadId;
    this.refinesLeft = refinesLeft;
    this._id = _id;
    this.useAsExample = useAsExample;
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

  async save() {
    const { errors } = this.validate();
    if (errors.length > 0) {
      return { errors };
    }

    const response = await fetch("/api/creations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: this.title,
        content: this.content,
        chatThread: this.threadId,
      }),
    });
    const data = (await response.json()).data;
    return { data };
  }
}
