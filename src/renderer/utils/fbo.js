export function createPostBuffers (regl, ...names) {
  const createBuffer = () => regl.framebuffer({
    color: regl.texture({
      mag: 'linear',
      min: 'linear',
      wrap: 'clamp'
    }),
    depth: false
  })

  const buffers = {
    blank: createBuffer()
  }
  names.forEach((name) => {
    buffers[name] = createBuffer()
  })

  return {
    get (name, size) {
      const buffer = buffers[name]
      if (size) buffer.resize(size[0], size[1])
      return buffer
    },

    swap (nameA, nameB) {
      const bufferA = buffers[nameA]
      const bufferB = buffers[nameB]
      buffers[nameA] = bufferB
      buffers[nameB] = bufferA
    },

    resize (name, size, factor = 1) {
      buffers[name].resize(
        Math.round(size[0] * factor),
        Math.round(size[1] * factor))
    }
  }
}
