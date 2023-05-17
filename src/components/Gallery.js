import Preview from "@/components/Preview";
import { useEffect, useRef, useState } from "react";
import CreationData from "@/models/CreationData";
import Button from "@/components/shared/Button";
import HeaderLogo from "@/components/HeaderLogo";

export default function Gallery({ creationId }) {
  const mainRef = useRef();
  const [creation, setCreation] = useState(new CreationData());
  const [preview, setPreview] = useState([]);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);

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
    e.preventDefault();
    if (!previous) {
      return;
    }
    window.location.href = `/gallery/${previous}`;
  }

  function showNext(e) {
    e.preventDefault();
    if (!next) {
      return;
    }
    window.location.href = `/gallery/${next}`;
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

  return (
    <div
      className="flex justify-center items-center h-screen"
      ref={mainRef}
      onKeyUp={handleKeyUp}
      tabIndex={0}
    >
      <div className="w-[808px] h-full border-l-4 border-r-4 border-amber-200 bg-black">
        <div className="h-16 pl-2 pr-2 border-b-2 border-neutral-600">
          <HeaderLogo />
          <div className="pl-2 align-middle font-extrabold text-white text-xl inline-block">
            3DGenie's Showroom
          </div>
        </div>
        <div className="h-[calc(100%-8rem)] overflow-scroll">
          <Preview previewObjects={preview} />
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
    </div>
  );
}
