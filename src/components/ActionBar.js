import { useState } from "react";
import Button from "@/components/shared/Button";
import RefineForm from "@/components/RefineForm";

export const availableActions = {
  gallery: "gallery",
  refine: "refine",
  save: "save",
  preview: "preview",
  share: "share",
};

export default function ActionBar({
  creation,
  onCreationChange,
  actions,
  showPreview,
  saveCreation,
  shareCreation,
  className,
}) {
  const [refine, setRefine] = useState(false);

  function canRefine() {
    return creation.refinesLeft > 0;
  }

  async function showRefinePopup(event) {
    if (canRefine()) {
      setRefine(true);
    }
  }

  function showGallery(e) {
    e.preventDefault();
    // TODO: gallery index page, remove hardcode ID
    window.location.href = `/gallery/645301ac77a3944f941ee4d4`;
  }

  return (
    <div
      className={`h-16 border flex justify-between w-full items-center pl-2.5 box-border bottom-0 ${className}`}
    >
      <div>
        {actions.includes(availableActions.gallery) && (
          <Button className="ml-2.5" onClick={showGallery}>
            Visit Showroom
          </Button>
        )}
      </div>
      <div>
        {actions.includes(availableActions.refine) && (
          <Button
            disabled={!canRefine()}
            onClick={showRefinePopup}
            className="mr-2.5"
          >
            Refine Spell
          </Button>
        )}
        <RefineForm
          showForm={refine}
          creation={creation}
          onCreationChange={onCreationChange}
          onComplete={() => setRefine(false)}
        />
        {actions.includes(availableActions.save) && (
          <Button
            onClick={saveCreation}
            disabled={creation.validate().errors.length > 0}
            className="mr-2.5"
          >
            Save
          </Button>
        )}
        {actions.includes(availableActions.share) && (
          <Button
            onClick={shareCreation}
            disabled={creation.validate().errors.length > 0}
            className="mr-2.5"
          >
            Share
          </Button>
        )}
        {actions.includes(availableActions.reload) && (
          <Button
            onClick={showPreview}
            disabled={!creation.content}
            className="mr-2.5"
          >
            Reload &#187;
          </Button>
        )}
      </div>
    </div>
  );
}
