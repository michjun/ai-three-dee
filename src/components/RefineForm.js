import { useState, useRef } from "react";
import Button from "@/components/shared/Button";
import CreationData from "@/models/CreationData";

export default function RefineForm({ creation, onCreationChange, onComplete }) {
  const promptInput = useRef();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refineInstructions: promptInput.current.value,
          threadId: creation.threadId,
        }),
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
          creation.title,
          content.slice(content.indexOf("[")),
          data.threadId,
          data.refinesLeft,
          creation.id
        )
      );
      onComplete();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="w-full p-2">
      <strong>Genie:</strong> I hear you. You still have {creation.refinesLeft}{" "}
      wishes. What would you like to change about {creation.title}?
      <textarea
        className="p-1.5 mr-4 mt-4 mb-4 h-20 w-full border border-neutral-300 rounded"
        type="text"
        ref={promptInput}
      />
      <div className="flex justify-end w-full">
        <Button type="submit" disabled={submitting} className="mr-0">
          {submitting ? "Thinking..." : "Make a wish"}
        </Button>
      </div>
    </form>
  );
}
