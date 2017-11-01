export function createTextureManager (regl, textureMap) {
  const cache = {}
  const empty = regl.texture()

  return function createTexture (key, size) {
    if (key == null) return empty

    const cached = cache[key]
    if (cached) return cached

    const image = document.createElement('img')
    const texture = cache[key] = regl.texture({
      width: size,
      height: size
    })
    image.src = textureMap[key]
    image.onload = () => {
      texture({data: image})
    }

    return texture
  }
}
