import { useState } from "react";
import Button from "@/components/shared/Button";
import CreationData from "@/models/CreationData";

export default function PromptBar({
  prompt,
  onPromptChange,
  onCreationChange,
}) {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }
    setSubmitting(true);
    onCreationChange(new CreationData(prompt));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creationDescription: prompt }),
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      // Sometimes ChatGPT returns extra text before the actual result,
      // so trim everything before the first "[" character
      const content = data.result.content;
      onCreationChange(
        new CreationData(
          prompt,
          content.slice(content.indexOf("[")),
          data.threadId,
          data.refinesLeft
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setSubmitting(false);
  }

  return (
    <div className="h-14 bg-lime-500 border flex items-center pl-2.5 box-border">
      <form onSubmit={onSubmit} className="flex w-full">
        <input
          className="p-1.5 mr-2 flex-grow"
          type="text"
          value={prompt || ""}
          placeholder="Genie, please create a 3D model of a..."
          onChange={onPromptChange}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Thinking..." : "Let's Go!"}
        </Button>
      </form>
    </div>
  );
}
