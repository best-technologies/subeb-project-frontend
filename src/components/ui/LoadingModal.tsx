"use client";
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  message: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with opacity */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />

          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-brand-primary mb-2">
              Loading...
            </h3>
            <p className="text-brand-accent-text text-sm">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
