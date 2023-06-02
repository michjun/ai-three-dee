import React, { useState, useEffect } from "react";
import { MdContentCopy } from "react-icons/md";
import Button from "@/components/shared/Button";

function CopyForm({ defaultText, onCopy }) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(defaultText);
  }, [defaultText]);

  const handleInputChange = (event) => {
    setText(event.target.value);
  };

  const handleCopy = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
        if (onCopy) {
          onCopy();
        }
        return;
      } catch (err) {
        console.error("Failed to copy with navigator.clipboard", err);
      }
    }
    // Fallback to document.execCommand
    var textField = textRef.current;
    textField.select();
    try {
      document.execCommand("copy");
      alert("Copied to clipboard");
      if (onCopy) {
        onCopy();
      }
    } catch (err) {
      alert("Failed to copy text");
    }
  };

  return (
    <form className="flex w-full">
      <input
        type="text"
        className="p-2 mr-2 flex-grow rounded-sm border border-neutral-400"
        value={text}
        onChange={handleInputChange}
      />
      <Button
        type="button"
        className="min-w-[40px] text-center flex items-center justify-center px-1 py-1"
        onClick={handleCopy}
      >
        <MdContentCopy className="text-xl" />
      </Button>
    </form>
  );
}

export default CopyForm;
