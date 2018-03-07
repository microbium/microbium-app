export function isFullscreen () {
  return window.innerWidth === window.screen.width &&
    window.innerHeight === window.screen.height
}

export function pixelRatio () {
  return Math.min(1.5, window.devicePixelRatio || 1)
}
