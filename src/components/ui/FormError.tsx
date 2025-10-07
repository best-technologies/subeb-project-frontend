import * as React from "react";

export const FormError: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;
  return <p className="text-destructive text-sm mt-1">{error}</p>;
};
