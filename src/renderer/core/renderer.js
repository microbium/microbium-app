import createREGL from 'regl'
import { vec2 } from 'gl-matrix'

import { createTextureManager } from '@renderer/utils/texture'
import { createPostBuffers } from '@renderer/utils/fbo'

import {
  createDrawBanding,
  createDrawEdges,
  createDrawGaussBlur,
  createDrawRect,
  createDrawScreen,
  createDrawTexture,
  createSetupDrawScreen
} from '@renderer/draw/commands/screen-space'

const DEBUG_LOG_GPU = true
const DEBUG_TRACK_GL = true

// OPTIM: Investigate preserveDrawingBuffer effect on perf
// It's currently needed to enable full dpi canvas export
export function createRenderer (tasks, state) {
  const canvas = document.createElement('canvas')
  const regl = createREGL({
    canvas,
    extensions: [
      // 'ANGLE_instanced_arrays',
      'OES_standard_derivatives',
      'OES_element_index_uint'
    ],
    attributes: {
      antialias: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      alpha: false,
      powerPreference: 'high-performance'
    }
  })

  const { resolutionMax } = state.viewport
  const { maxRenderbufferSize } = regl.limits
  vec2.set(resolutionMax,
    maxRenderbufferSize, maxRenderbufferSize)

  const textures = createTextureManager(regl)
  const postBuffers = createPostBuffers(regl,
    'full', 'fullExport', 'banding', 'edges', 'blurA', 'blurB')
  const commands = {
    setupDrawScreen: createSetupDrawScreen(regl),
    drawBanding: createDrawBanding(regl),
    drawEdges: createDrawEdges(regl),
    drawScreen: createDrawScreen(regl),
    drawGaussBlur: createDrawGaussBlur(regl, postBuffers),
    drawRect: createDrawRect(regl),
    drawTexture: createDrawTexture(regl)
  }
  const tracker = createGlTracker(regl)

  if (DEBUG_LOG_GPU) logGpuInfo(regl)

  tasks.defer((containers) => {
    containers.scene.appendChild(canvas)
    return Promise.resolve()
  }, 'inject')

  tasks.add((event) => {
    const { resolution } = state.viewport
    canvas.width = resolution[0]
    canvas.height = resolution[1]
  }, 'resize')

  return {
    regl,
    canvas,
    textures,
    postBuffers,
    commands,
    tracker
  }
}

function createGlTracker (regl) {
  let gl = regl._gl
  let state = {
    log: [],
    enabled: false
  }

  if (DEBUG_TRACK_GL) {
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
  }

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

function logGpuInfo (regl) {
  let gl = regl._gl
  let debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  let vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
  let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

  console.log('gpu', { vendor, renderer })
}
