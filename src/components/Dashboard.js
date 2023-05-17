import Preview from "@/components/Preview";
import PromptBar from "@/components/PromptBar";
import { useEffect, useState } from "react";
import ActionBar, { availableActions } from "@/components/ActionBar";
import CreationData from "@/models/CreationData";
import Modal from "@/components/shared/Modal";
import HeaderLogo from "@/components/HeaderLogo";

export default function Dashboard() {
  const [creation, setCreation] = useState(new CreationData());
  const [preview, setPreview] = useState([]);
  const [contentSaved, setContentSaved] = useState(true);
  const [refreshPreview, setRefreshPreview] = useState(false);
  const [showWelcomeMsg, setShowWelcomeMsg] = useState(false);

  useEffect(() => {
    const welcomeMsgSeen = window.localStorage.getItem("welcomeMsgSeen");

    if (!welcomeMsgSeen) {
      setShowWelcomeMsg(true);
      window.localStorage.setItem("welcomeMsgSeen", true);
    }
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
          <HeaderLogo />
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
          actions={[
            availableActions.gallery,
            availableActions.refine,
            availableActions.share,
          ]}
          shareCreation={shareCreation}
          className="border-0 bg-black pr-2"
        />
      </div>
      <Modal
        easeIn={true}
        isOpen={showWelcomeMsg}
        onClose={() => setShowWelcomeMsg(false)}
      >
        <div className="w-full p-4">
          <img className="h-full inline-block" src="/genie2.png" alt="logo" />
          <div className="pt-4 text-center">
            Greetings and salutations! I am the mystical 3DGenie, your host in
            this wondrous realm! My magic enables me to conjure 3D models spun
            from your wildest dreams. Whisper your desires into the textbox atop
            your screen, and behold as I weave a spell, bringing your vision to
            life!
            <br />
            <br />
            Now, I must confess, even a genie's work might not always be
            flawless. But fret not, for you have three precious chances to guide
            me, refining and perfecting my creation to your satisfaction. At
            your beck and call, I am, ready to sprinkle a dash of fun on your
            day! Step right in, and may your journey be filled with marvels!
          </div>
        </div>
      </Modal>
    </div>
  );
}
