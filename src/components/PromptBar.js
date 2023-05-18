import { useState } from "react";
import Button from "@/components/shared/Button";
import CreationData from "@/models/CreationData";
import WaitingMessage from "@/components/WaitingMessage";
import Modal from "@/components/shared/Modal";

export default function PromptBar({
  prompt,
  onPromptChange,
  hasUnsavedChanges,
  onCreationChange,
  className,
}) {
  const [showWaitMessage, setShowWaitMessage] = useState(false);

  async function onSubmit(event) {
    if (!prompt) {
      alert("Please enter your wish to the 3DGenie.");
      return;
    }
    if (hasUnsavedChanges) {
      if (!confirm("Are you sure you want to start a new spell?")) {
        return;
      }
    }
    onCreationChange(new CreationData(prompt));

    const waitMsgTimeout = setTimeout(() => {
      setShowWaitMessage(true);
    }, 8000);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creationDescription: prompt }),
      });
      const data = await response.json();
      setShowWaitMessage(false);
      clearTimeout(waitMsgTimeout);

      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      // Sometimes ChatGPT returns extra text before the actual result,
      // so trim everything before the first "[" character
      const content = data.result.content;
      if (content === "Unrelated") {
        alert(
          "Ah, a twist in the cosmic tale! Your wish, dear friend, is beyond my mystical reach. Please, bestow upon me another request!"
        );
      } else {
        onCreationChange(
          new CreationData(
            prompt,
            content.slice(content.indexOf("[")),
            data.threadId,
            data.refinesLeft
          )
        );
      }
    } catch (error) {
      setShowWaitMessage(false);
      clearTimeout(waitMsgTimeout);
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div
      className={`h-14 border flex items-center pl-2 box-border ${className}`}
    >
      <form className="flex w-full">
        <input
          className="p-1.5 mr-2 flex-grow rounded-sm"
          type="text"
          value={prompt || ""}
          placeholder="3DGenie, grant me a stunning 3D model of a..."
          onChange={onPromptChange}
        />
        <Button
          disabled={!prompt}
          className="mr-2.5"
          onClick={onSubmit}
          loadingText={"Producing Spell..."}
        >
          Send My Wish
        </Button>
      </form>
      <Modal
        easeIn={true}
        isOpen={showWaitMessage}
        imgSrc="/genie2.png"
        onClose={() => setShowWaitMessage(false)}
      >
        <WaitingMessage />
      </Modal>
    </div>
  );
}