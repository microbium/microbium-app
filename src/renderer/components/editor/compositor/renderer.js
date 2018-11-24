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

// OPTIM: Investigate preserveDrawingBuffer effect on perf
// It's currently needed to enable full dpi canvas export
export function createRenderer (tasks, state) {
  const canvas = document.createElement('canvas')
  const regl = createREGL({
    canvas,
    extensions: [
      'ANGLE_instanced_arrays',
      'OES_standard_derivatives',
      'OES_element_index_uint'
    ],
    attributes: {
      antialias: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      alpha: false
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
    drawGaussBlur: createDrawGaussBlur(regl),
    drawRect: createDrawRect(regl),
    drawTexture: createDrawTexture(regl)
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
    canvas,
    textures,
    postBuffers,
    commands
  }
}
