"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"

type Props = {
  src: string
  className?: string
}

export default function CustomVideoPlayer({ src, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const volumeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [showControls, setShowControls] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volumeHover, setVolumeHover] = useState(false)

  const timePercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  const volumePercentage = muted ? 0 : volume * 100

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          togglePlay()
          break
        case "m":
          toggleMute()
          break
        case "f":
          toggleFullscreen()
          break
        case "arrowright":
          if (videoRef.current) videoRef.current.currentTime += 2
          break
        case "arrowleft":
          if (videoRef.current) videoRef.current.currentTime -= 2
          break
        case "arrowup":
          setVolume((prev) => Math.min(prev + 0.1, 1))
          setMuted(false)
          break
        case "arrowdown":
          setVolume((prev) => Math.max(prev - 0.1, 0))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay, toggleMute, toggleFullscreen])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted
      videoRef.current.volume = volume
    }
  }, [muted, volume])

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onLoadedMetadata = () => setDuration(video.duration)

    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("loadedmetadata", onLoadedMetadata)

    return () => {
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
    }
  }, [])

  const handleVolumeEnter = () => {
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current)
    setVolumeHover(true)
  }

  const handleVolumeLeave = () => {
    volumeTimerRef.current = setTimeout(() => {
      setVolumeHover(false)
    }, 500)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col justify-end bg-black overflow-hidden group/player ${
        isFullscreen ? "w-screen h-screen" : "w-full h-72 rounded-xl"
      } ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        className="absolute inset-0 w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Control Bar */}
      <div
        className={`relative z-10 w-full p-4 flex items-center gap-3 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        } bg-gradient-to-t from-black/90 via-black/20 to-transparent`}
        onClick={(e) => e.stopPropagation()} // Bar click prevents video pause
      >
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            togglePlay(); 
          }} 
          className="shrink-0 hover:scale-110 transition-transform"
        >
          {playing ? <Pause fill="white" size={22} className="text-white" /> : <Play fill="white" size={22} className="text-white" />}
        </button>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value)
          }}
          onClick={(e) => e.stopPropagation()} // Timeline click prevents video pause
          className="flex-grow h-1.5 cursor-pointer appearance-none bg-white/30 rounded-full"
          style={{
            backgroundImage: `linear-gradient(to right, white ${timePercentage}%, transparent ${timePercentage}%)`,
          }}
        />

        <span className="text-white text-xs tabular-nums shrink-0 font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className="relative flex flex-col items-center"
            onMouseEnter={handleVolumeEnter}
            onMouseLeave={handleVolumeLeave}
            onClick={(e) => e.stopPropagation()} // Volume section click prevents video pause
          >
            <div
              className={`absolute bottom-full mb-4 flex flex-col items-center bg-black/90 p-3 rounded-full h-28 w-10 transition-all ${
                volumeHover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  setVolume(val)
                  setMuted(val === 0)
                }}
                className="w-20 h-1 appearance-none bg-white/30 rounded-full -rotate-90 cursor-pointer origin-center mt-10"
                style={{
                  backgroundImage: `linear-gradient(to right, white ${volumePercentage}%, transparent ${volumePercentage}%)`,
                }}
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="hover:scale-110 transition-transform p-1"
            >
              {muted || volume === 0 ? <VolumeX size={22} className="text-white" /> : <Volume2 size={22} className="text-white" />}
            </button>
          </div>

          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              toggleFullscreen(); 
            }} 
            className="hover:scale-110 transition-transform p-1"
          >
            {isFullscreen ? <Minimize size={22} className="text-white" /> : <Maximize size={22} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}