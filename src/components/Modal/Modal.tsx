import { FC, useEffect, useRef } from "react";

type Props = {
  isVisible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

const Modal: FC<Props> = ({ isVisible, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "auto";
    };
  }, [isVisible, onClose]);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current && onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {children || (
          <div className="p-6" id="modal-title">
            Modal Content
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
