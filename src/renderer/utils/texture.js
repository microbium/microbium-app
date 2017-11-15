export function createTextureManager (regl, textureMap) {
  const cache = {}
  const empty = regl.texture()

  return function createTexture (key) {
    if (key == null) return empty

    const cached = cache[key]
    if (cached) return cached

    const descriptor = textureMap[key]
    const image = document.createElement('img')
    const texture = regl.texture({
      width: descriptor.size,
      height: descriptor.size
    })
    cache[key] = texture
    image.src = descriptor.path
    image.onload = () => {
      texture({data: image})
    }

    return texture
  }
}
