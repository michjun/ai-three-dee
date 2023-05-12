export default class CreationData {
  constructor(
    title = null,
    content = null,
    threadId = null,
    refinesLeft = 0,
    id = null
  ) {
    this.title = title;
    this.content = content;
    this.threadId = threadId;
    this.refinesLeft = refinesLeft;
    this.id = id;
  }

  contentToJson() {
    return this.content
      ?.replace(/(\w+)\s*:/g, '"$1":')
      ?.replace(/},\s*]/g, "}]");
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
