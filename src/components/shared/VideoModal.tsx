"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => {
          // Unmute after autoplay starts successfully
          if (videoRef.current) {
            videoRef.current.muted = false;
          }
        })
        .catch(() => {
          // Autoplay blocked — user can press play manually
        });
    }
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 sm:-top-12 sm:-right-2 text-white hover:text-gray-300 transition-colors cursor-pointer z-10"
          aria-label="Close video"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Video */}
        <video
          ref={videoRef}
          src={isOpen ? "/videos/subeb-demo.mp4" : undefined}
          controls
          autoPlay
          playsInline
          preload="auto"
          className="w-full rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}
