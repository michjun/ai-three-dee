import { useState } from "react";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import RefineForm from "@/components/RefineForm";

export default function ActionBar({
  creation,
  onCreationChange,
  showPreview,
  saveCreation,
}) {
  const [saving, setSaving] = useState(false);
  const [refine, setRefine] = useState(false);

  function canRefine() {
    return creation.refinesLeft > 0;
  }

  function showRefinePopup(event) {
    event.preventDefault();
    if (canRefine()) {
      setRefine(true);
    }
  }

  function onPreview(event) {
    event.preventDefault();
    showPreview();
  }

  async function onSave(event) {
    event.preventDefault();
    if (saving) {
      return;
    }
    setSaving(true);
    await saveCreation();
    setSaving(false);
  }

  return (
    <div className="h-14 border flex justify-end w-full items-center pl-2.5 box-border absolute bottom-0">
      <div>
        <Button disabled={!canRefine()} onClick={showRefinePopup}>
          Refine Creation
        </Button>
        <Modal isOpen={refine} onClose={() => setRefine(false)}>
          <RefineForm
            creation={creation}
            onCreationChange={onCreationChange}
            onComplete={() => setRefine(false)}
          />
        </Modal>
        <Button onClick={onSave} disabled={saving}>
          Save
        </Button>
        <Button onClick={onPreview}>Reload &#187;</Button>
      </div>
    </div>
  );
}
