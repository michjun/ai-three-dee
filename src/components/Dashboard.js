import Preview from "@/components/Preview";
import PromptBar from "@/components/PromptBar";
import { useEffect, useState } from "react";
import ActionBar, { availableActions } from "@/components/ActionBar";
import CreationData from "@/models/CreationData";
import { data } from "autoprefixer";

export default function Dashboard() {
  const [creation, setCreation] = useState(new CreationData());
  const [preview, setPreview] = useState([]);
  const [contentSaved, setContentSaved] = useState(true);
  const [refreshPreview, setRefreshPreview] = useState(false);

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
      setContentSaved(true);
      return data._id;
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert("Sorry, something is wrong");
    }
  }

  async function shareCreation() {
    let creationId = creation.id;
    if (!creationId || !contentSaved) {
      creationId = await saveCreation();
    }
    if (creationId) {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_HOST_URL}/gallery/${creationId}`
      );
      alert("Share link copied to clipboard!");
    } else {
      alert("Sorry, something is wrong");
    }
  }

  function showPreview() {
    try {
      const jsonString = creation.contentToJson();
      setPreview(jsonString ? JSON.parse(jsonString) : []);
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert(
        "Genie: Sorry, I am currently having a mental breakdown. Please try again later."
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
    <div className="flex justify-center items-center h-screen">
      <div className="w-[808px] h-full border-l-4 border-r-4 border-amber-200 bg-black">
        <div className="h-16 flex pl-2 pr-2">
          <img
            className="h-full inline-block pt-1"
            src="/genie2.png"
            alt="logo"
          />
          <PromptBar
            prompt={creation.title}
            hasUnsavedChanges={!contentSaved}
            onPromptChange={onPromptChange}
            onCreationChange={setCreationAndRefreshView}
            className="grow border-0 bg-black pt-2"
          />
        </div>
        <div className="h-[calc(100%-8rem)]">
          <Preview previewObjects={preview} />
        </div>
        <ActionBar
          creation={creation}
          onCreationChange={setCreationAndRefreshView}
          actions={[availableActions.refine, availableActions.share]}
          shareCreation={shareCreation}
          className="border-0 bg-black pr-2"
        />
      </div>
    </div>
  );
}
