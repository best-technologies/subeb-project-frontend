"use client";
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  message: string;
  title?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  message,
  title = "Crunching Data...",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop covering the whole page */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal Content */}
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
