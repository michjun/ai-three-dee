import { useState } from "react";
import Button from "./shared/Button";

export default function TopBar({
  creation,
  reset,
  showPreview,
  saveCreation,
  updateCreation,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  function onTitleChange(event) {
    updateCreation({ title: event.target.value });
  }

  async function onPreview(event) {
    event.preventDefault();
    showPreview();
  }

  async function onSave(event) {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    await saveCreation();
    setSaving(false);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    reset();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creationDescription: creation.title }),
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
      updateCreation({
        content: content.slice(content.indexOf("[")),
      });
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
    setSubmitting(false);
  }

  return (
    <div className="h-14 bg-lime-500 border flex justify-between items-center pl-2.5 box-border min-w-[550px]">
      <form onSubmit={onSubmit}>
        <input
          className="p-1.5 mr-2 w-64"
          id="creation"
          type="text"
          value={creation?.title || ""}
          placeholder="Create a 3D model of a..."
          onChange={onTitleChange}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Thinking..." : "Let's Go!"}
        </Button>
      </form>
      <div>
        <Button onClick={onSave}>Save</Button>
        <Button onClick={onPreview}>View &#187;</Button>
      </div>
    </div>
  );
}
