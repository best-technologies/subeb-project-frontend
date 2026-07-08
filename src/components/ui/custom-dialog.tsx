import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  showCloseButton = true,
}: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label="Close dialog"
      />
      <div
        className="relative z-10 w-full max-w-lg mx-4 bg-background text-foreground rounded-xl shadow-xl overflow-hidden"
        style={{
          maxHeight: "calc(100dvh - 2rem)",
          marginTop: "1rem",
          marginBottom: "1rem",
          paddingBottom: "env(safe-area-inset-bottom, 1rem)",
        }}
      >
        <div style={{ maxHeight: "inherit", overflowY: "auto" }}>
          {children}
          {showCloseButton && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors opacity-70 hover:opacity-100"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
