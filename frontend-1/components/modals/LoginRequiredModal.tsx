"use client";

import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LoginRequiredModal({ open, onClose }: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl animate-scaleIn">
        <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          🔒 Login Required
        </h2>

        <p className="mt-2 text-gray-600">
          Please login first to access this feature.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full bg-gray-200 px-6 py-2 font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onClose();
              window.location.href = "/sign-in";
            }}
            className="rounded-full bg-primary px-6 py-2 font-bold text-white"
          >
            Login
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
