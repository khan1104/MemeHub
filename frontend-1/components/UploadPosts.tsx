"use client"

import { useState } from "react"
import { X, Image, Check } from "lucide-react"
import { CATEGORIES } from "@/data/MemeCategories"
import { uploadPostSchema } from "@/schemas/Posts"
import CustomVideoPlayer from "./CustomVideoPlayer"

type UploadModalProps = {
  open: boolean
  onClose: () => void
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const [caption, setCaption] = useState("")
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<"image" | "video" | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!open) return null

  /* 🔁 Reset form */
  const resetForm = () => {
    setCaption("")
    setSelectedCats([])
    setFile(null)
    setPreviewUrl(null)
    setFileType(null)
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  /* 📂 File handler */
  const handleFile = (file: File) => {
    setFile(file)
    setFileType(file.type.startsWith("video") ? "video" : "image")
    setPreviewUrl(URL.createObjectURL(file))
  }

  /* 🏷 Category toggle */
  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat)
      if (prev.length >= 3) return prev
      return [...prev, cat]
    })
  }

  /* ✅ Zod validation */
  const validateForm = () => {
    const result = uploadPostSchema.safeParse({
      caption,
      file,
      tags: selectedCats,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}

      result.error.errors.forEach((err) => {
        const field = err.path[0]
        if (field) {
          fieldErrors[field as string] = err.message
        }
      })

      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    console.log("uploaded sucess")
    return true
  }

  /* 🚀 Submit */
  const handleUpload = () => {
    if (!validateForm()) return

    // 👉 FormData (future API call)
    const formData = new FormData()
    formData.append("caption", caption)
    formData.append("file", file!)
    selectedCats.forEach((tag) => formData.append("tags", tag))

    console.log("Validated & Ready to Upload")

    resetForm()
    onClose()
  }

  const isFormValid =
    file !== null && caption.trim().length > 0 && selectedCats.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-2">
      {/* Overlay */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Create a Meme</h2>
          <button onClick={handleClose}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          {/* Upload */}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-purple-500 transition">
            {previewUrl ? (
              fileType === "video" ? (
                // <video src={previewUrl} controls className="max-h-56 rounded-lg" />
                <CustomVideoPlayer src={previewUrl} />
              ) : (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="max-h-56 rounded-lg object-contain"
                />
              )
            ) : (
              <>
                <Image size={40} className="text-purple-600" />
                <p className="mt-2 font-semibold">Upload Image or Video</p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, MP4 • Max 20MB
                </p>
              </>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFile(e.target.files[0])
              }
            />
          </label>

          {errors.file && (
            <p className="text-sm text-red-500 text-center">{errors.file}</p>
          )}

          {/* Caption */}
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a funny caption..."
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
          />

          {errors.caption && (
            <p className="text-sm text-red-500">{errors.caption}</p>
          )}

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <h3 className="font-semibold">Select Categories</h3>
              <span className="text-sm text-gray-500">
                {selectedCats.length}/3
              </span>
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
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition
                      ${
                        active
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }
                      ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    {active && <Check size={14} className="inline mr-1" />}
                    {cat}
                  </button>
                )
              })}
            </div>

            {errors.tags && (
              <p className="text-sm text-red-500">{errors.tags}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={!isFormValid}
            onClick={handleUpload}
            className="rounded-full bg-purple-600 px-6 py-2 text-sm font-bold text-white
              hover:bg-purple-700 disabled:opacity-50"
          >
            Upload Meme 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
