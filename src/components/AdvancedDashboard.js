import Preview from "@/components/Preview";
import CreationList from "@/components/CreationList";
import PromptBar from "@/components/PromptBar";
import { useEffect, useState } from "react";
import CreationData from "@/models/CreationData";
import { availableActions } from "@/components/ActionBar";
import ActionBar from "@/components/ActionBar";
import HeaderLogo from "@/components/HeaderLogo";

export default function AdvancedDashboard() {
  const [creation, setCreation] = useState(new CreationData());
  const [preview, setPreview] = useState([]);
  const [contentSaved, setContentSaved] = useState(true);
  const [refreshPreview, setRefreshPreview] = useState(false);
  const [refreshCreations, setRefreshCreations] = useState(true);
  const [canvasSize, setCavasSize] = useState();

  const selectedStyle = "bg-amber-500";

  useEffect(() => {
    const handleResize = () => {
      const canvasSize = Math.min(
        800,
        window.innerWidth / 2 - 8,
        window.innerHeight - 128
      );
      setCavasSize(canvasSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      setContentSaved(true);
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert("invalid data");
    }
  }

  function creationListItem(item) {
    return (
      <li
        key={item.id}
        className={`text-white cursor-pointer border-b border-neutral-300 ${
          item.id === creation.id ? selectedStyle : ""
        }`}
      >
        <a
          className="block w-full p-2.5"
          onClick={(e) => setCreationAndRefreshView(item)}
        >
          {item.title}
        </a>
      </li>
    );
  }

  function showPreview() {
    try {
      const jsonString = creation.contentToJson();
      setPreview(jsonString ? JSON.parse(jsonString) : []);
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert(
        "3DGenie: Sorry, I am currently having a mental breakdown. Please try again later."
      );
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
    setContentSaved(false);
  }

  function setCreationAndRefreshView(creation) {
    setCreation(creation);
    setRefreshPreview(true);
    if (creation.id) {
      setContentSaved(true);
    } else {
      setContentSaved(false);
    }
  }

  return (
    <div>
      <div className="absolute inset-y-0 w-1/2 font-mono">
        <div className="absolute w-1/4 h-full bg-gradient-to-b from-sky-800 to-indigo-800">
          <div className="border-b border-neutral-300 bg-black h-14">
            <HeaderLogo showTitle={true} />
          </div>
          <div className="h-[calc(100%-3.5rem)] overflow-scroll">
            <CreationList
              refresh={refreshCreations}
              getCreationItem={creationListItem}
              onRefreshComplete={() => setRefreshCreations(false)}
            />
          </div>
        </div>
        <div className="absolute left-1/4 w-3/4 h-full">
          <PromptBar
            prompt={creation.title}
            hasUnsavedChanges={!contentSaved}
            onPromptChange={onPromptChange}
            onCreationChange={setCreationAndRefreshView}
            className="bg-gradient-to-r from-sky-800 to-indigo-800"
          />
          <textarea
            className="w-full h-[calc(100%-7.5rem)] absolute top-[3.5rem] bottom-0 box-border p-2.5"
            value={creation.content || ""}
            onChange={onContentChange}
          />
          <ActionBar
            creation={creation}
            actions={[
              availableActions.refine,
              availableActions.save,
              availableActions.reload,
            ]}
            onCreationChange={setCreationAndRefreshView}
            showPreview={showPreview}
            saveCreation={saveCreation}
            className="absolute"
          />
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2 bg-black">
        <Preview canvasSize={canvasSize} previewObjects={preview} />
      </div>
    </div>
  );
}
