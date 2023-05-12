import Preview from "@/components/Preview";
import CreationList from "@/components/CreationList";
import PromptBar from "@/components/PromptBar";
import { useEffect, useState } from "react";
import ActionBar from "@/components/ActionBar";
import CreationData from "@/models/CreationData";

export default function Dashboard() {
  const [creation, setCreation] = useState(new CreationData());
  const [preview, setPreview] = useState([]);
  const [refreshPreview, setRefreshPreview] = useState(false);
  const [refreshCreations, setRefreshCreations] = useState(true);

  useEffect(() => {
    if (refreshPreview) {
      showPreview();
      setRefreshPreview(false);
    }
  }, [refreshPreview]);

  async function saveCreation() {
    const { errors } = creation.validate();
    if (errors.length > 0) {
      return alert(errors.join("\n"));
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
          chatThread: creation.threadId,
        }),
      });
      const data = (await response.json()).data;
      setCreation(
        new CreationData(
          data.title,
          data.content,
          data.chatThread,
          creation.refinesLeft,
          data._id
        )
      );
      setRefreshCreations(true);
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert("invalid data");
    }
  }

  function showPreview() {
    try {
      const jsonString = creation.contentToJson();
      setPreview(jsonString ? JSON.parse(jsonString) : []);
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert("invalid data");
    }
  }

  function onPromptChange(event) {
    setCreation(
      new CreationData(
        event.target.value,
        creation.content,
        creation.threadId,
        creation.refinesLeft,
        creation.id
      )
    );
  }

  function onContentChange(event) {
    setCreation(
      new CreationData(
        creation.title,
        event.target.value,
        creation.threadId,
        creation.refinesLeft,
        creation.id
      )
    );
  }

  function setCreationAndRefreshView(creation) {
    setCreation(creation);
    setRefreshPreview(true);
  }

  return (
    <div>
      <div className="absolute inset-y-0 w-1/2 font-mono">
        <div className="absolute w-1/4 h-full bg-amber-600">
          <div className="border-b border-neutral-300 bg-rose-500 h-14">
            <img className="h-full inline-block" src="/logo.png" alt="logo" />
            <div className="pl-1 align-middle font-extrabold text-white text-lg hidden lg:inline-block">
              3dGenie
            </div>
          </div>
          <div className="h-[calc(100%-3.5rem)] overflow-scroll">
            <CreationList
              refresh={refreshCreations}
              selectedCreationId={creation.id}
              onCreationSelected={setCreationAndRefreshView}
              onRefreshComplete={() => setRefreshCreations(false)}
            />
          </div>
        </div>
        <div className="absolute left-1/4 w-3/4 h-full">
          <PromptBar
            prompt={creation.title}
            onPromptChange={onPromptChange}
            onCreationChange={setCreationAndRefreshView}
          />
          <textarea
            className="w-full h-[calc(100%-7rem)] absolute top-[3.5rem] bottom-0 box-border p-2.5"
            value={creation.content || ""}
            onChange={onContentChange}
          />
          <ActionBar
            creation={creation}
            onCreationChange={setCreationAndRefreshView}
            showPreview={showPreview}
            saveCreation={saveCreation}
          />
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2 bg-black">
        <Preview previewObjects={preview} />
      </div>
    </div>
  );
}
