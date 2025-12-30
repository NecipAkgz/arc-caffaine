"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface BioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBio: string;
  onSave: (newBio: string) => Promise<void>;
}

export default function BioModal({
  isOpen,
  onClose,
  initialBio,
  onSave,
}: BioModalProps) {
  const [bio, setBio] = useState(initialBio);
  const [loading, setLoading] = useState(false);
  const maxLength = 160;

  useEffect(() => {
    setBio(initialBio);
  }, [initialBio, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    const promise = onSave(bio);

    toast.promise(promise, {
      loading: "Updating your bio...",
      success: () => {
        onClose();
        return "Bio updated successfully! ☕";
      },
      error: "Failed to update bio. Please try again.",
    });

    try {
      await promise;
    } catch (error) {
      console.error("Failed to save bio", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Profile Bio</h2>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setBio(e.target.value);
                }
              }}
              placeholder="Tell your supporters about yourself..."
              className="w-full p-3 rounded-lg bg-secondary/30 border border-border resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {bio.length}/{maxLength}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
