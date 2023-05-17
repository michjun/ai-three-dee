import { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, easeIn = false, children }) => {
  const [opacityClass, setOpacityClass] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setOpacityClass("opacity-100"), 50);
    } else {
      setOpacityClass("opacity-0");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        className={`relative bg-amber-100 rounded p-6 w-full max-w-lg ${
          easeIn
            ? `transition-opacity duration-1000 ease-in ${opacityClass}`
            : ""
        }`}
      >
        <button
          className="absolute top-2 right-4 text-xl font-bold focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
