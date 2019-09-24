export function createGlLogger (gl) {
  const state = {
    log: [],
    enabled: false
  }

  const funcs = []
  for (const key in gl) {
    const val = gl[key]
    if (typeof val === 'function') {
      funcs.push(key)
    }
  }

  funcs.forEach((key) => {
    const fn = gl[key]
    gl[key] = (...args) => {
      if (state.enabled) {
        state.log.push({
          fn: key,
          args
        })
      }
      return fn.apply(gl, args)
    }
  })

  const enable = () => {
    state.log = []
    state.enabled = true
  }

  const disable = () => {
    state.enabled = false
  }

  const getLog = () => {
    return state.log
  }

  return {
    enable,
    disable,
    getLog
  }
}

export function getGpuInfo (gl) {
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

  return {
    vendor,
    renderer
  }
}
