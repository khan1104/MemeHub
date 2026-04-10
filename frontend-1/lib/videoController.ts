let activeVideo: HTMLVideoElement | null = null;

export function setActiveVideo(video: HTMLVideoElement | null) {
  if (activeVideo && activeVideo !== video) {
    activeVideo.pause();
  }
  activeVideo = video;
}