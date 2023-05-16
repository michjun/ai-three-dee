import { useRef } from "react";
import Button from "@/components/shared/Button";
import CreationData from "@/models/CreationData";

export default function RefineForm({ creation, onCreationChange, onComplete }) {
  const promptInput = useRef();

  async function onSubmit() {
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
          data.refinesLeft
        )
      );
      onComplete();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <form className="w-full p-2">
      <strong>3DGenie:</strong> I have heard your words. {creation.refinesLeft}{" "}
      wishes yet remain for you. Now, tell me, what transformation do you desire
      for the humble {creation.title}?
      <textarea
        className="p-1.5 mr-4 mt-4 mb-4 h-20 w-full border border-neutral-300 rounded"
        type="text"
        ref={promptInput}
      />
      <div className="flex justify-end w-full">
        <Button
          onClick={onSubmit}
          loadingText="Producing Spell..."
          className="mr-0"
        >
          Send My Wish
        </Button>
      </div>
    </form>
  );
}
