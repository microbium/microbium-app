export function isFullscreen () {
  return window.innerWidth === window.screen.width &&
    window.innerHeight === window.screen.height
}
