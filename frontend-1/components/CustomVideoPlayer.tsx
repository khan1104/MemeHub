"use client"

import { useRef, useEffect } from "react"

type Props = {
  src: string
  className?: string
}

export default function CustomVideoPlayer({ src, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return

      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault() 
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          if (videoRef.current.paused) videoRef.current.play().catch(() => {})
          else videoRef.current.pause()
          break
        case "m":
          videoRef.current.muted = !videoRef.current.muted
          break
        case "f":
          if (!document.fullscreenElement) {
            videoRef.current.requestFullscreen()
          } else {
            document.exitFullscreen()
          }
          break
        case "arrowright":
          videoRef.current.currentTime += 2
          break
        case "arrowleft":
          videoRef.current.currentTime -= 2
          break
        case "arrowup":
          videoRef.current.volume = Math.min(videoRef.current.volume + 0.1, 1)
          videoRef.current.muted = false
          break
        case "arrowdown":
          videoRef.current.volume = Math.max(videoRef.current.volume - 0.1, 0)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      playsInline
      // className={`w-full h-72 rounded-xl bg-black object-contain ${className}`}
      // className={`${className?className:'w-full h-72 rounded-xl bg-black object-contain'}`}
      className={className}
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}
