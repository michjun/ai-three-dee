import { useState } from "react";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import RefineForm from "@/components/RefineForm";

export const availableActions = {
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

  return (
    <div
      className={`h-14 border flex justify-end w-full items-center pl-2.5 box-border bottom-0 ${className}`}
    >
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
        <Modal isOpen={refine} onClose={() => setRefine(false)}>
          <RefineForm
            creation={creation}
            onCreationChange={onCreationChange}
            onComplete={() => setRefine(false)}
          />
        </Modal>
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
