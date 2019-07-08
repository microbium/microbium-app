export function createGlLogger (gl) {
  let state = {
    log: [],
    enabled: false
  }

  let funcs = []
  for (let key in gl) {
    let val = gl[key]
    if (typeof val === 'function') {
      funcs.push(key)
    }
  }

  funcs.forEach((key) => {
    let fn = gl[key]
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
  let debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  let vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
  let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

  return {
    vendor,
    renderer
  }
}
