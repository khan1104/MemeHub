"use client"

import { useState, useEffect } from "react"
import { X, ImageIcon, Check, Loader2, AlertCircle } from "lucide-react"
import { CATEGORIES } from "@/data/MemeCategories"
import CustomVideoPlayer from "./CustomVideoPlayer"
import { usePost } from "@/hooks/post"

type UploadModalProps = {
  open: boolean
  onClose: () => void
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const { uploadPost, loading, error,setError } = usePost()
  const [caption, setCaption] = useState("")
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<"image" | "video" | null>(null)

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!open) return null

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setCaption("")
    setSelectedCats([])
    setFile(null)
    setPreviewUrl(null)
    setFileType(null)
    setError(null)
  }

  const handleClose = () => {
    if (loading) return 
    resetForm()
    onClose()
  }

  const handleFile = (file: File) => {
    // If there's an existing preview, revoke it first
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    
    setFile(file)
    setFileType(file.type.startsWith("video") ? "video" : "image")
    setPreviewUrl(URL.createObjectURL(file))
  }

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat)
      if (prev.length >= 3) return prev
      return [...prev, cat]
    })
  }

  const handleUpload = async () => {
    if (!file) return

    const success = await uploadPost(caption, file, selectedCats)
    
    if (success) {
      // Small delay or immediate close
      handleClose()
    }
  }

  const isFormValid = file !== null && caption.trim().length > 0 && selectedCats.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2">
      <div onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="mt-4 text-lg font-bold text-gray-700">Uploading your meme...</p>
          </div>
        )}
        
        <div className="flex items-center justify-between bg-purple-600 px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Create a Meme</h2>
          <button onClick={handleClose} disabled={loading} className="hover:bg-white/20 rounded-full p-1 transition">
            <X size={22} />
          </button>
        </div>

        <div className={`max-h-[80vh] overflow-y-auto hover-scrollbar space-y-6 px-6 py-6 transition-opacity ${loading ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-3 transition hover:border-purple-500 min-h-[260px] bg-gray-50">
            {previewUrl ? (
              <div className="relative w-full h-[260px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                
                {fileType === "video" ? (
                  <CustomVideoPlayer
                    src={previewUrl}
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="
                      max-h-full
                      max-w-full
                      object-contain
                      rounded-lg
                      transition
                    "
                  />
                )}
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon size={42} className="mx-auto text-purple-600" />
                <p className="mt-2 font-semibold text-gray-700">
                  Upload Image or Video
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, MP4 • Max 20MB
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </label>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a funny caption..."
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-purple-500 transition resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <h3 className="font-semibold text-gray-800">Select Categories</h3>
              <span className="text-sm text-gray-500">{selectedCats.length}/3</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCats.includes(cat)
                const disabled = !active && selectedCats.length >= 3

                return (
                  <button
                    key={cat}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition
                      ${active ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                      ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    {active && <Check size={14} className="mr-1" />}
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!isFormValid || loading}
            onClick={handleUpload}
            className="flex items-center gap-2 rounded-full bg-purple-600 px-8 py-2 text-sm font-bold text-white
              hover:bg-purple-700 shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            Upload Meme 🚀
          </button>
        </div>
      </div>
    </div>
  )
}