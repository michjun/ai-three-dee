import { useRef, useState } from "react";
import Button from "@/components/shared/Button";
import CreationData from "@/models/CreationData";
import Modal from "@/components/shared/Modal";

export default function RefineForm({
  showForm,
  creation,
  onCreationChange,
  onComplete,
}) {
  const [canClose, setCanClose] = useState(true);
  const promptInput = useRef();

  async function onSubmit() {
    try {
      setCanClose(false);
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
      creation.threadId = data.threadId;
      creation.refinesLeft = data.refinesLeft;
      // Sometimes ChatGPT returns extra text before the actual result,
      // so trim everything before the first "[" character
      const content = data.result.content;
      if (content === "Unrelated") {
        onCreationChange(new CreationData(creation));
        alert(
          "Ah, a twist in the cosmic tale! Your wish, dear friend, is beyond my mystical reach. Please, bestow upon me another request!"
        );
      } else {
        creation.content = content.slice(content.indexOf("["));
        onCreationChange(new CreationData(creation));
      }
      onComplete();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setCanClose(true);
  }

  return (
    <Modal
      isOpen={showForm}
      imgSrc="/genie2.png"
      onClose={() => {
        if (canClose) {
          onComplete();
        }
      }}
    >
      <form>
        <div className="text-center">
          I have heard your words. {creation.refinesLeft} wishes yet remain for
          you.
          <br />
          Now, tell me, what transformation or improvements do you desire from
          the humble {creation.title}?
        </div>
        <textarea
          className="p-1.5 mr-4 mt-4 mb-4 h-20 w-full border border-neutral-300 rounded"
          type="text"
          ref={promptInput}
        />
        <div className="flex justify-end w-full">
          <Button
            onClick={onSubmit}
            loadingText="Producing Spell, Please Wait..."
            className="mr-0"
          >
            Send My Wish
          </Button>
        </div>
      </form>
    </Modal>
  );
}
