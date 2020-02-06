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

  function addToCache (key, resource) {
    cache[key] = resource
  }

  function getTexture (key, src, opts = RGB_LINEAR) {
    if (key == null) return null

    const cached = cache[key]
    if (cached && cached.src === src) return cached.texture

    const texture = (cached && cached.texture) || regl.texture(opts)
    if (src == null) {
      if (!cached) addToCache(key, { src, texture })
      return texture
    }

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
    addToCache(key, { src, image, texture })

    return texture
  }

  return {
    get: getTexture
  }
}
