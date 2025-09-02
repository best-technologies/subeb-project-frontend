import * as React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background text-foreground rounded-xl shadow-xl w-full max-w-md mx-4 p-6 relative">
        {title && (
          <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-lg"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close modal"
      />
    </div>
  );
};
