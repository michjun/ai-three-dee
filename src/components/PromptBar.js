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
  updateStream,
  className,
}) {
  const [showWaitMessage, setShowWaitMessage] = useState(false);

  function connectAIStream() {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        `${
          process.env.NEXT_PUBLIC_HOST_URL
        }/api/generate?model=${encodeURIComponent(prompt)}`
      );
      let done = false;
      let result = "";
      eventSource.onmessage = (event) => {
        const data = event.data;
        if (done) {
          const { threadId, refineCount } = JSON.parse(data);
          eventSource.close();
          resolve({ result, threadId, refineCount });
        }
        if (data === "[DONE]") {
          done = true;
        } else if (data === "[ERROR]") {
          eventSource.close();
          reject();
        } else {
          result += data;
          updateStream(result);
        }
      };
      eventSource.onerror = (event) => {
        console.error(`Event Source Error: ${event}`);
        eventSource.close();
        reject();
      };
    });
  }

  async function onSubmit(event) {
    if (!prompt || prompt.trim().length === 0) {
      alert("Please enter your wish to the 3DGenie.");
      return;
    }
    if (hasUnsavedChanges) {
      if (!confirm("Are you sure you want to start a new spell?")) {
        return;
      }
    }
    updateStream("");

    const waitMsgTimeout = setTimeout(() => {
      setShowWaitMessage(true);
    }, 60000);

    try {
      updateStream("");
      const { result, threadId, refineCount } = await connectAIStream();
      setShowWaitMessage(false);
      clearTimeout(waitMsgTimeout);
      onCreationChange(new CreationData(prompt, result, threadId, refineCount));
    } catch (error) {
      setShowWaitMessage(false);
      clearTimeout(waitMsgTimeout);
      console.error(error);
      alert(
        "Ah, a twist in the cosmic tale! Your wish, dear friend, is beyond my mystical reach. Please, bestow upon me another request!"
      );
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
          <span className="hidden md:inline">Send My Wish</span>
          <span className="inline md:hidden">Send</span>
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
