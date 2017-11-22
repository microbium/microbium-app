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
    return (size) => {
      const buffer = buffers[name]
      if (size) buffer.resize(size[0], size[1])
      return buffer
    }
  }

  return {
    getRead: getBuffer('read'),
    getWrite: getBuffer('write'),

    resize (size) {
      const { read, write } = buffers
      read.resize(size[0], size[1])
      write.resize(size[0], size[1])
    },

    swap () {
      const { read, write } = buffers
      buffers.read = write
      buffers.write = read
    }
  }
}
