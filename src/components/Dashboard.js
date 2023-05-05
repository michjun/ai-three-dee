import Preview from "./Preview";
import CreationList from "./CreationList";
import TopBar from "./TopBar";

import { useState } from "react";

export default function Dashboard() {
  const [creation, setCreation] = useState(null);
  const [preview, setPreview] = useState([]);
  const [reloadCreations, setReloadCreations] = useState(0);

  async function saveCreation() {
    if (!creation?.title) {
      alert("Please enter a title for your creation.");
      return;
    }
    if (!creation?.content) {
      alert("Please generate a 3d model creation first.");
      return;
    }
    try {
      const response = await fetch("/api/creations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: creation.title,
          content: creation.content,
        }),
      });
      setReloadCreations(reloadCreations + 1);
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert("invalid data");
    }
  }

  function reset() {
    updateCreation({ content: null, _id: null });
    setPreview([]);
  }

  function showPreview() {
    if (creation?.content) {
      try {
        const jsonString = creation.content
          .replace(/(\w+)\s*:/g, '"$1":')
          .replace(/},\s*]/g, "}]");
        setPreview(JSON.parse(jsonString));
      } catch (error) {
        console.error("Error parsing the input string:", error);
        alert("invalid data");
      }
    } else {
      alert("Please generate a 3d model creation first.");
    }
  }

  function handleCreationSelected(selectedCreation) {
    setCreation(selectedCreation);
  }

  function handleCreationContentChanged(event) {
    updateCreation({ content: event.target.value });
  }

  function updateCreation(properties) {
    setCreation((prevState) => ({ ...prevState, ...properties }));
  }

  return (
    <div>
      <div className="absolute inset-y-0 w-1/2 font-mono">
        <div className="absolute w-1/4 h-full bg-amber-600">
          <div className="border-b border-neutral-300 bg-rose-500 h-14">
            <img className="h-full inline-block" src="/logo.png" alt="logo" />
            <div className="pl-2 pt-2 font-extrabold text-white text-lg hidden lg:inline-block">
              MM Labs
            </div>
          </div>
          <CreationList
            reload={reloadCreations}
            selectedCreationId={creation?._id}
            onCreationSelected={handleCreationSelected}
          />
        </div>
        <div className="absolute left-1/4 w-3/4 h-full">
          <TopBar
            creation={creation}
            reset={reset}
            showPreview={showPreview}
            saveCreation={saveCreation}
            updateCreation={updateCreation}
          />
          <textarea
            className="w-full h-[calc(100%-3.5rem)] absolute top-[3.5rem] bottom-0 box-border p-2.5"
            id="editor"
            value={creation?.content || ""}
            onChange={handleCreationContentChanged}
          />
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2 bg-black">
        <Preview previewObjects={preview} />
      </div>
    </div>
  );
}
