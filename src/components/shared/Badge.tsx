import React from "react";

interface BadgeProps {
  text: string;
}

export default function Badge({ text }: BadgeProps) {
  return (
    <span className="text-sm font-semibold text-green-600 uppercase tracking-wide border border-brand-green-accent px-5 py-2 rounded-full bg-brand-green-accent/5">
      {text}
    </span>
  );
}
