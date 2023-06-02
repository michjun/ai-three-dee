import Preview from "@/components/Preview";
import PromptBar from "@/components/PromptBar";
import { useEffect, useState } from "react";
import ActionBar, { availableActions } from "@/components/ActionBar";
import CreationData from "@/models/CreationData";
import Modal from "@/components/shared/Modal";
import HeaderLogo from "@/components/HeaderLogo";
import { isJsonString, creationContentToJson } from "@/utils/json";

export default function Dashboard({ canvasSize }) {
  const [creation, setCreation] = useState(new CreationData({}));
  const [preview, setPreview] = useState([]);
  const [stream, setStream] = useState();
  const [contentSaved, setContentSaved] = useState(true);
  const [showWelcomeMsg, setShowWelcomeMsg] = useState(false);

  useEffect(() => {
    const welcomeMsgSeen = window.localStorage.getItem("welcomeMsgSeen");

    if (!welcomeMsgSeen) {
      setShowWelcomeMsg(true);
      window.localStorage.setItem("welcomeMsgSeen", true);
    }
  }, []);

  async function saveCreation() {
    try {
      const { data, errors } = await creation.save();
      if (errors) {
        return alert(errors.join("\n"));
      }
      setCreation(new CreationData(data));
      setContentSaved(true);
      return data._id;
    } catch (error) {
      console.error("Error saving creation:", error);
      alert("Sorry, something is wrong");
    }
  }

  async function shareCreation() {
    let creationId = creation._id;
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

  function showPreview(content) {
    try {
      setPreview(content ? JSON.parse(content) : []);
    } catch (error) {
      console.error("Error parsing the input string:", error);
      alert(
        "3DGenie: Sorry, I am currently having a mental breakdown. Please try again later."
      );
    }
  }

  function onPromptChange(event) {
    const title = event.target.value;
    setCreation(new CreationData({ ...creation, title }));
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
    showPreview(creation.contentToJson());
    setContentSaved(creation._id ? true : false);
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div
        style={{ width: (canvasSize?.width || 800) + 8 }}
        className="h-full border-l-4 border-r-4 border-amber-200 bg-black"
      >
        <div className="h-16 flex pl-2 pr-2 border-b-2 border-neutral-600">
          <HeaderLogo />
          <PromptBar
            prompt={creation.title}
            hasUnsavedChanges={!contentSaved}
            onPromptChange={onPromptChange}
            onCreationChange={setCreationAndRefreshView}
            updateStream={updateStream}
            className="grow border-0 bg-black pt-2"
          />
        </div>
        <div className="h-[calc(100%-8rem)]">
          <Preview
            canvasSize={canvasSize}
            previewObjects={preview}
            streamObjects={stream}
          />
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
          className="border-0 border-t-2 border-neutral-600 pr-2"
        />
      </div>
      <Modal
        easeIn={true}
        isOpen={showWelcomeMsg}
        imgSrc="/genie2.png"
        onClose={() => setShowWelcomeMsg(false)}
      >
        <div className="text-center">
          Greetings and salutations! I am the mystical 3DGenie, your host in
          this wondrous realm! My magic enables me to conjure 3D models spun
          from your wildest dreams. Whisper your desires into the textbox atop
          your screen, and behold as I weave a spell, bringing your vision to
          life!
          <br />
          <br />
          Now, I must confess, even a genie's work might not always be flawless.
          But fret not, for you have three precious chances to guide me,
          refining and perfecting my creation to your satisfaction. At your beck
          and call, I am, ready to sprinkle a dash of fun on your day! Step
          right in, and may your journey be filled with marvels!
        </div>
      </Modal>
    </div>
  );
}
