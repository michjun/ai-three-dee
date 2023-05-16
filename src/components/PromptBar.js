import Button from "@/components/shared/Button";
import CreationData from "@/models/CreationData";

export default function PromptBar({
  prompt,
  onPromptChange,
  hasUnsavedChanges,
  onCreationChange,
  className,
}) {
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
  }

  return (
    <div
      className={`h-14 border flex items-center pl-2.5 box-border ${className}`}
    >
      <form className="flex w-full">
        <input
          className="p-1.5 mr-2 flex-grow"
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
    </div>
  );
}
