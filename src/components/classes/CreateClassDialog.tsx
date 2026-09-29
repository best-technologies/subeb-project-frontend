"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { createClass } from "@/services/api/classes";
import { toast } from "react-hot-toast";
import {
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";

interface CreateClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateClassDialog: React.FC<CreateClassDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a class name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createClass({
        name: trimmed,
        grade: trimmed,
      });

      if (res.success) {
        toast.success(`Class "${trimmed}" created successfully!`);
        onSuccess?.();
        onClose();
      } else {
        setError(res.message || "Failed to create class.");
      }
    } catch (err: any) {
      console.error("Create class error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred while creating class.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-md p-0 border-gray-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">
                    Create New Class
                  </DialogTitle>
                  <DialogDescription className="text-emerald-100 text-xs mt-0.5">
                    Define a state-wide class curriculum level
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Class Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Class Name *
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Primary 1, JSS 1, ECCDE 1"
                className="h-9.5 text-xs bg-white"
                autoFocus
                required
              />
              <p className="text-[11px] text-gray-500">
                State-wide classes are curriculum levels available to all registered schools.
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 sm:p-5 bg-gray-50/80 border-t border-gray-100 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-brand-primary hover:bg-brand-primary-2 text-white text-xs h-9 gap-1.5 px-4 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Class...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Class</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

