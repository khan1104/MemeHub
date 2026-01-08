"use client"

import { useState } from "react"
import { X, ImageIcon, Check, Loader2, AlertCircle } from "lucide-react"
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
  
  // UI States
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  if (!open) return null

  /* 🔁 Reset form */
  const resetForm = () => {
    setCaption("")
    setSelectedCats([])
    setFile(null)
    setPreviewUrl(null)
    setFileType(null)
    setErrors({})
    setServerError(null)
    setIsUploading(false)
  }

  const handleClose = () => {
    if (isUploading) return // Prevent closing while upload is in progress
    resetForm()
    onClose()
  }

  /* 📂 File handler */
  const handleFile = (file: File) => {
    setFile(file)
    setFileType(file.type.startsWith("video") ? "video" : "image")
    setPreviewUrl(URL.createObjectURL(file))
    // Clear file error if user picks a new one
    if (errors.file) setErrors((prev) => ({ ...prev, file: "" }))
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

    result.error.issues.forEach((err) => {
      const field = err.path[0]
      if (field) fieldErrors[field as string] = err.message
    })

    setErrors(fieldErrors)
    return false
  }

  setErrors({})
  return true
}

  /* 🚀 Submit */
  const handleUpload = async () => {
    if (!validateForm()) return

    setIsUploading(true)
    setServerError(null)

    const formData = new FormData()
    formData.append("caption", caption)
    formData.append("file", file!) 
    
    // FastAPI requires multiple appends for a list
    selectedCats.forEach((tag) => {
      formData.append("tags", tag)
    })

    try {
      const response = await fetch("http://127.0.0.1:8000/api/posts/", {
        method: "POST",
        body: formData,
        headers: {
          // Replace with your actual auth logic
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTU3ZDY1Y2ZhNjI3NGNlNjcyOGFhNjIiLCJleHAiOjE3Njc0Mzc2NzR9.IlI5lG2MEamF77exc0rjITe8hjQ-qcKHoXFUCRUaHSw`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle FastAPI validation error structure
        const errorMsg = Array.isArray(data.detail) 
          ? `${data.detail[0].loc[1]}: ${data.detail[0].msg}` 
          : data.detail || "Upload failed"
        throw new Error(errorMsg)
      }

      console.log("Upload success:", data)
      resetForm()
      onClose()
    } catch (err) {
      console.error("Upload error:", err)
      setServerError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsUploading(false)
    }
  }

  const isFormValid = file !== null && caption.trim().length > 0 && selectedCats.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2">
      {/* Overlay */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        
        {/* 1. Loading State Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="mt-4 text-lg font-bold text-gray-700">Uploading your meme...</p>
          </div>
        )}

        {/* 2. Error Modal Overlay */}
        {serverError && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-xl font-bold text-gray-900">Upload Failed</h3>
              <p className="mt-2 text-sm text-gray-600">{serverError}</p>
              <button
                onClick={() => setServerError(null)}
                className="mt-6 w-full rounded-lg bg-red-500 py-2.5 font-bold text-white transition hover:bg-red-600"
              >
                Go Back & Fix
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between bg-purple-600 px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Create a Meme</h2>
          <button onClick={handleClose} disabled={isUploading}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className={`max-h-[80vh] overflow-y-auto space-y-6 px-6 py-6 transition-opacity ${isUploading ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          
          {/* File Upload Section */}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-purple-500 transition">
            {previewUrl ? (
              fileType === "video" ? (
                <CustomVideoPlayer src={previewUrl} className="w-full h-72 rounded-xl bg-black object-contain"/>
              ) : (
                <img src={previewUrl} alt="preview" className="max-h-56 rounded-lg object-contain" />
              )
            ) : (
              <>
                <ImageIcon size={40} className="text-purple-600"/>
                <p className="mt-2 font-semibold">Upload Image or Video</p>
                <p className="text-sm text-gray-500">JPG, PNG, MP4 • Max 20MB</p>
              </>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </label>

          {errors.file && <p className="text-sm text-red-500 text-center">{errors.file}</p>}

          {/* Caption Input */}
          <div className="space-y-1">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a funny caption..."
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-purple-500 transition"
            />
            {errors.caption && <p className="text-sm text-red-500">{errors.caption}</p>}
          </div>

          {/* Categories Section */}
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
            {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            disabled={!isFormValid || isUploading}
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