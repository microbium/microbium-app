import { LineBuilder } from 'regl-line-builder'

import { curve } from '@/utils/draw'
import linesEntitiesVert from '@/shaders/lines-entities.vert'
import linesEntitiesFrag from '@/shaders/lines-entities.frag'

export function createScene (tasks, state, renderer) {
  const { createTexture, regl } = renderer
  const { styles } = state.controls

  const alphaMapOpts = {
    min: 'nearest',
    mag: 'nearest',
    wrap: ['repeat', 'repeat'],
    format: 'rgb'
  }

  // TODO: Investigate huge perf issues in Chrome when using instancing
  // TODO: Optimize shared state between contexts
  const contexts = styles.map((style, index) => {
    const bufferSize = 2 ** 12
    const lines = LineBuilder.create(regl, {
      bufferSize,
      drawArgs: {
        vert: linesEntitiesVert,
        frag: linesEntitiesFrag,
        uniforms: {
          angle: regl.prop('angle'),
          angleAlpha: regl.prop('angleAlpha'),
          hatchAlpha: regl.prop('hatchAlpha'),
          tint: regl.prop('tint'),
          // FEAT: Add multiple screen space tinting functions
          useScreenTintFunc: regl.prop('useScreenTintFunc'),
          diffuseMap: (params, { diffuseMap }) => createTexture(diffuseMap),
          useDiffuseMap: (params, { diffuseMap }) => (diffuseMap == null ? 0 : 1),
          alphaMap: (params, { alphaMap }) => createTexture(alphaMap, alphaMapOpts),
          useAlphaMap: (params, { alphaMap }) => (alphaMap == null ? 0 : 1)
        },
        blend: {
          enable: true,
          equation: 'add',
          func: {
            src: 'src alpha',
            dst: 'one minus src alpha'
          }
        }
      }
    })

    const ctx = lines.getContext('2d')
    ctx.curve = curve.bind(ctx)

    return {
      bufferSize,
      index,
      style,
      lines,
      ctx
    }
  })

  return {
    contexts
  }
}

// FEAT: Add static radial grid context, remove grid marking from css background-image
export function createUIScene (tasks, state, renderer) {
  const { regl } = renderer

  const contexts = ['main', 'grid'].map((name, index) => {
    // TODO: Make bufferSize smallest possible for UI
    const bufferSize = 2 ** 9
    const lines = LineBuilder.create(regl, {
      bufferSize
    })

    const ctx = lines.getContext('2d')
    ctx.curve = curve.bind(ctx)

    return {
      bufferSize,
      index,
      name,
      lines,
      ctx
    }
  })

  return {
    contexts,
    main: contexts[0],
    grid: contexts[1]
  }
}
