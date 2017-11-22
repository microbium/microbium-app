export function createPostBuffers (regl) {
  const createBuffer = () => regl.framebuffer({
    color: regl.texture({wrap: 'clamp'}),
    depth: false
  })
  const buffers = {
    read: createBuffer(),
    write: createBuffer()
  }
  const getBuffer = (name) => {
    return (width, height) => {
      const buffer = buffers[name]
      if (width && height) buffer.resize(width, height)
      return buffer
    }
  }

  return {
    getRead: getBuffer('read'),
    getWrite: getBuffer('write'),

    resize (width, height) {
      const { read, write } = buffers
      read.resize(width, height)
      write.resize(width, height)
    },

    swap () {
      const { read, write } = buffers
      buffers.read = write
      buffers.write = read
    }
  }
}
