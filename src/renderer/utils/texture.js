export function createTextureManager (regl, textureMap) {
  const cache = {}
  const empty = regl.texture()

  return function createTexture (key, textureOpts = {}) {
    if (key == null) return empty

    const cached = cache[key]
    if (cached) return cached

    const descriptor = textureMap[key]
    const texture = regl.texture(Object.assign({
      width: descriptor.size,
      height: descriptor.size
    }, textureOpts))
    const image = document.createElement('img')

    cache[key] = texture
    image.src = descriptor.path
    image.onload = () => {
      texture({data: image})
    }

    return texture
  }
}
