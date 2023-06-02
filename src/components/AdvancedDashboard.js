import Preview from "@/components/Preview";
import CreationList from "@/components/CreationList";
import PromptBar from "@/components/PromptBar";
import { useEffect, useState } from "react";
import CreationData from "@/models/CreationData";
import { availableActions } from "@/components/ActionBar";
import ActionBar from "@/components/ActionBar";
import HeaderLogo from "@/components/HeaderLogo";
import { MdContentCopy } from "react-icons/md";
import { isJsonString, creationContentToJson } from "@/utils/json";

export default function AdvancedDashboard() {
  const [creation, setCreation] = useState(new CreationData({}));
  const [preview, setPreview] = useState([]);
  const [stream, setStream] = useState();
  const [contentSaved, setContentSaved] = useState(true);
  const [refreshPreview, setRefreshPreview] = useState(false);
  const [refreshCreations, setRefreshCreations] = useState(true);
  const [canvasSize, setCanvasSize] = useState();

  const selectedStyle = "bg-amber-500";

  useEffect(() => {
    const handleResize = () => {
      const canvasSize = Math.min(
        800,
        window.innerWidth / 2 - 8,
        window.innerHeight - 128
      );
      setCanvasSize(canvasSize);
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
    try {
      const { data, errors } = await creation.save();
      if (errors) {
        return alert(errors.join("\n"));
      }
      setCreation(new CreationData(data));
      setRefreshCreations(true);
      setContentSaved(true);
    } catch (error) {
      console.error("Error saving creation:", error);
      alert("invalid data");
    }
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
    creation.title = event.target.value;
    setCreation(new CreationData(creation));
  }

  function onContentChange(event) {
    creation.content = event.target.value;
    setCreation(new CreationData(creation));
    setContentSaved(false);
  }

  function updateStream(stream) {
    const jsonStream = creationContentToJson(stream + "]");
    if (isJsonString(jsonStream)) {
      setStream(JSON.parse(jsonStream));
    } else if (!stream) {
      setStream([]);
    }
  }

  function setCreationAndRefreshView(creation) {
    setCreation(creation);
    setRefreshPreview(true);
    setContentSaved(creation._id ? true : false);
  }

  function creationListItem(item) {
    return (
      <li
        key={item._id}
        className={`text-white cursor-pointer border-b border-neutral-300 ${
          item._id === creation._id ? selectedStyle : ""
        }`}
      >
        <a
          className="block w-full p-2.5 flex justify-between items-center"
          onClick={(e) => setCreationAndRefreshView(item)}
        >
          <div className={item.useAsExample ? "text-yellow-300" : ""}>
            {item.title}
          </div>
          <div
            className="text-white w-4 pr-1"
            onClick={async (e) => {
              e.stopPropagation();
              await navigator.clipboard.writeText(item._id);
              alert("ID copied to clipboard!");
            }}
          >
            <MdContentCopy />
          </div>
        </a>
      </li>
    );
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
            updateStream={updateStream}
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
      <div className="absolute inset-y-0 right-0 w-1/2 bg-black pl-1">
        <Preview
          canvasSize={canvasSize}
          previewObjects={preview}
          streamObjects={stream}
        />
      </div>
    </div>
  );
}
