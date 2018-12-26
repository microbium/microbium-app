// TODO: Handle image load errors
export function createTextureManager (regl) {
  const cache = {}
  const empty = regl.texture()

  function getTexture (key, src, opts = {}) {
    if (key == null || src == null) return empty

    const cached = cache[key]
    if (cached && cached.src === src) return cached.texture

    const texture = (cached && cached.texture) || regl.texture(opts)
    const image = document.createElement('img')

    image.onload = () => {
      const { naturalWidth, naturalHeight } = image
      texture({
        width: naturalWidth,
        height: naturalHeight,
        data: image
      })
    }
    image.src = `file://${src}`
    cache[key] = { src, image, texture }

    return texture
  }

  return {
    get: getTexture
  }
}
