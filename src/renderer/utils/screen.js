export function isFullscreen () {
  return window.innerWidth === window.screen.width &&
    window.innerHeight === window.screen.height
}

export function pixelRatio () {
  return window.devicePixelRatio || 1
}

export function pixelRatioClamped () {
  return Math.min(1.5, pixelRatio())
}

export function clampPixelRatio (size, pixelRatio, maxDimension) {
  const biggestDim = Math.max(size[0], size[1]) * pixelRatio
  return pixelRatio / Math.max(1, biggestDim / maxDimension)
}
