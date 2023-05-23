import Preview from "@/components/Preview";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import CreationData from "@/models/CreationData";
import Button from "@/components/shared/Button";
import HeaderLogo from "@/components/HeaderLogo";
import Modal from "@/components/shared/Modal";

export default function Gallery({ canvasSize }) {
  const mainRef = useRef();
  const router = useRouter();

  const [creationId, setCreationId] = useState(null);
  const [creation, setCreation] = useState(new CreationData());
  const [preview, setPreview] = useState([]);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);
  const [showGalleryMsg, setShowGalleryMsg] = useState(false);

  useEffect(() => {
    const galleryMsgSeen = window.localStorage.getItem("galleryMsgSeen");

    if (!galleryMsgSeen) {
      setShowGalleryMsg(true);
      window.localStorage.setItem("galleryMsgSeen", true);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setCreationId(router.query.id);
  }, [router.isReady]);

  useEffect(() => {
    if (!creationId) {
      return;
    }
    async function fetchData() {
      try {
        const response = await fetch(`/api/creations/${creationId}`);
        const data = (await response.json()).data;
        setCreation(
          new CreationData(
            data.creation.title,
            data.creation.content,
            data.creation.chatThread,
            0,
            data.creation._id
          )
        );
        setPrevious(data.prevId);
        setNext(data.nextId);
        mainRef.current.focus();
      } catch (error) {
        console.error("Error parsing the input string:", error);
        alert("invalid data");
      }
    }
    fetchData();
  }, [creationId]);

  useEffect(() => {
    showPreview();
  }, [creation]);

  function handleKeyUp(e) {
    switch (e.key) {
      case "ArrowLeft":
        showPrevious(e);
        break;
      case "ArrowRight":
        showNext(e);
        break;
      default:
        break;
    }
  }

  function showPrevious(e) {
    if (!previous) {
      return;
    }
    setCreationId(previous);
    router.push(`/gallery/${previous}`, undefined, { shallow: true });
  }

  function showNext(e) {
    if (!next) {
      return;
    }
    setCreationId(next);
    router.push(`/gallery/${next}`, undefined, { shallow: true });
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

  function goToHome() {
    window.location.href = "/";
  }

  return (
    <div
      className="flex justify-center items-center h-full"
      ref={mainRef}
      onKeyUp={handleKeyUp}
      tabIndex={0}
    >
      <div
        className="h-full border-l-4 border-r-4 border-amber-200 bg-black"
        style={{ width: canvasSize + 8 }}
      >
        <div className="h-16 pl-2 pr-2 border-b-2 border-neutral-600 flex justify-between">
          <div>
            <HeaderLogo />
            <div className="pl-2 align-middle font-extrabold text-white text-xl hidden md:inline-block">
              3DGenie's Showroom
            </div>
            <div className="pl-2 align-middle font-extrabold text-white text-xl inline-block md:hidden">
              Showroom
            </div>
          </div>
          <div className="pt-3 pr-1">
            <Button onClick={goToHome}>Start Creating &raquo;</Button>
          </div>
        </div>
        <div className="h-[calc(100%-8rem)] overflow-scroll">
          <Preview canvasSize={canvasSize} previewObjects={preview} />
        </div>
        <div className="h-16 flex justify-between w-full items-center pl-2.5 box-border bottom-0 border-0 border-t-2 border-neutral-600">
          <Button disabled={!previous} onClick={showPrevious}>
            <div className="pb-1 text-[22px]">&nbsp;&#8249;&nbsp;</div>
          </Button>
          <div className="text-white flex-grow text-center text-lg">
            {creation.title}
          </div>
          <Button disabled={!next} onClick={showNext} className="mr-2.5">
            <div className="pb-1 text-[22px]">&nbsp;&#8250;&nbsp;</div>
          </Button>
        </div>
      </div>
      <Modal
        isOpen={showGalleryMsg}
        imgSrc="/genie2.png"
        onClose={() => setShowGalleryMsg(false)}
      >
        <div className="text-center">
          Greetings, traveler! I am 3D Genie, master of this grand exhibit,
          powered by the sorcery of GPT-4! Marvel at the dreams I've sculpted
          into existence!
          <br />
          <br />
          Revel in their splendor, and dare you might, cast your own wish into
          my mystical cauldron for manifestation!
        </div>
      </Modal>
    </div>
  );
}
