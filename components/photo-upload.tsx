"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Dropzone + file picker for the profile photo. POSTs multipart to
 * /api/profile-photo which proxies to Dilly's real upload endpoint.
 * Refreshes the current route on success so the new photo shows up in the
 * nav avatar and anywhere else it's rendered.
 */
export function PhotoUpload({
  hasExisting = false,
}: {
  hasExisting?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Keep it under 8 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/profile-photo", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error || "Upload failed. Try again.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={
        "card flex flex-col items-center justify-center gap-3 p-8 text-center transition " +
        (dragging ? "border-[color:var(--color-accent)] bg-[color:var(--color-lavender)]" : "")
      }
    >
      <div className="text-3xl" aria-hidden>📷</div>
      <div>
        <div className="editorial text-lg tracking-tight">
          {hasExisting ? "Replace your photo" : "Add a photo"}
        </div>
        <div className="mt-1 text-sm text-[color:var(--color-muted)]">
          Drag and drop, or pick a file. Square looks best.
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn btn-primary"
      >
        {uploading ? "Uploading…" : hasExisting ? "Choose a new photo" : "Choose a photo"}
      </button>
      {error && (
        <div className="text-xs text-[color:var(--color-red)]">{error}</div>
      )}
    </div>
  );
}
