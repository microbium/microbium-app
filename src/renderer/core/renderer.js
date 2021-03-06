import createREGL from 'regl'
import { vec2 } from 'gl-matrix'

import { createTextureManager } from '@renderer/utils/texture'
import { createPostBuffers } from '@renderer/utils/fbo'
import {
  createGlLogger,
  getGpuInfo
} from '@renderer/utils/gl-logger'

import {
  createDrawBanding,
  createDrawEdges,
  createDrawFeedback,
  createDrawGaussBlur,
  createDrawRect,
  createDrawScreen,
  createDrawTexture
} from '@renderer/draw/commands/screen-space'

const DEBUG_LOG_GPU = false
const DEBUG_TRACK_GL = false

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
      preserveDrawingBuffer: false,
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
    'full', 'fullExport',
    'banding', 'edges',
    'bloom', 'blurA', 'blurB')

  const commands = {
    drawBanding: createDrawBanding(regl, postBuffers),
    drawEdges: createDrawEdges(regl, postBuffers),
    drawFeedback: createDrawFeedback(regl, postBuffers, textures),
    drawScreen: createDrawScreen(regl, postBuffers),
    drawGaussBlur: createDrawGaussBlur(regl, postBuffers),
    drawRect: createDrawRect(regl, postBuffers),
    drawTexture: createDrawTexture(regl, postBuffers)
  }
  const logger = DEBUG_TRACK_GL
    ? createGlLogger(regl._gl)
    : null

  const info = getGpuInfo(regl._gl)
  state.renderer.info = info

  if (DEBUG_LOG_GPU) {
    console.log('gpu', info)
  }

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
    info,
    canvas,
    textures,
    postBuffers,
    commands,
    logger
  }
}
