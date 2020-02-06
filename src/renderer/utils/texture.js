const SRC_BASE = process.env.IS_WEB ? '' : 'file://'

const RGB_LINEAR = {
  channels: 3,
  min: 'linear',
  mag: 'linear',
  wrap: 'clamp'
}

// TODO: Handle image load errors
// TODO: Convert npot textures with canvas
export function createTextureManager (regl) {
  const cache = {}
  const empty = regl.texture()

  function getTexture (key, src, opts = RGB_LINEAR) {
    if (key == null || src == null) return empty

    const cached = cache[key]
    if (cached && cached.src === src) return cached.texture

    const texture = (cached && cached.texture) || regl.texture()
    const image = document.createElement('img')
    image.crossOrigin = 'Anonymous'

    image.onload = () => {
      const { naturalWidth, naturalHeight } = image
      texture({
        width: naturalWidth,
        height: naturalHeight,
        data: image,
        ...opts
      })
    }

    image.src = `${SRC_BASE}${src}`
    cache[key] = { src, image, texture }

    return texture
  }

  return {
    get: getTexture
  }
}
