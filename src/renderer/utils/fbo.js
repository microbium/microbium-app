export function createPostBuffers (regl, ...names) {
  const createBuffer = () => regl.framebuffer({
    color: regl.texture({wrap: 'clamp'}),
    depth: false
  })

  const buffers = {}
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

    resize (size) {
      names.forEach((name) => {
        buffers[name].resize(size[0], size[1])
      })
    }
  }
}
