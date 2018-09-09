import { LineBuilder } from 'regl-line-builder'

import { curve, polyline } from '@src/utils/draw'
import linesEntitiesVert from '@src/shaders/lines-entities.vert'
import linesEntitiesFrag from '@src/shaders/lines-entities.frag'
import linesUIFrag from '@src/shaders/lines-ui.frag'

export function createScene (tasks, state, renderer) {
  const { regl } = renderer

  const blend = {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      dstRGB: 'one minus src alpha',
      srcAlpha: 'one',
      dstAlpha: 'one minus src alpha'
    },
    equation: {
      rgb: 'add',
      alpha: 'add'
    },
    color: [0, 0, 0, 0]
  }
  const depth = {
    enable: false
  }

  // const alphaMapOpts = {
  //   min: 'nearest',
  //   mag: 'nearest',
  //   wrap: ['clamp', 'repeat'],
  //   format: 'rgb'
  // }

  const uniforms = {
    tick: regl.prop('tick'),
    dashFunction: regl.prop('dashFunction'),
    tint: regl.prop('tint'),
    mirror: regl.prop('mirror')

    // FEAT: Add multiple screen space tinting functions
    // useScreenTintFunc: regl.prop('useScreenTintFunc'),
    // diffuseMap: (params, { diffuseMap }) => textures.get(diffuseMap),
    // useDiffuseMap: (params, { diffuseMap }) => (diffuseMap == null ? 0 : 1),
    // alphaMap: (params, { alphaMap }) => textures.get(alphaMap, alphaMapOpts),
    // useAlphaMap: (params, { alphaMap }) => (alphaMap == null ? 0 : 1)
  }

  const attributes = {
    angle: {
      buffer: regl.prop('angles'),
      divisor: 1
    },
    angleAlpha: {
      buffer: regl.prop('anglesAlpha'),
      divisor: 1
    }
  }

  // OPTIM: Investigate huge perf issues in Chrome when using instancing
  // OPTIM: Optimize shared state between contexts
  const contexts = []

  function createContext (style, index) {
    const bufferSize = 2 ** 12
    const lines = LineBuilder.create(regl, {
      dimensions: 2,
      bufferSize,
      drawArgs: {
        vert: linesEntitiesVert,
        frag: linesEntitiesFrag,
        instances: (context, { angles }) => angles.length,
        uniforms,
        attributes,
        blend,
        depth
      }
    })

    const ctx = lines.getContext('2d')
    ctx.curve = curve.bind(ctx)
    ctx.polyline = polyline.bind(ctx)

    return {
      bufferSize,
      index,
      style,
      lines,
      ctx
    }
  }

  function removeContext (context, index) {
    context.destroy()
  }

  function syncContexts (styles) {
    const diff = styles.length - contexts.length
    if (diff < 0) {
      for (let i = 0; i < diff; i++) {
        const index = contexts.length - 1
        const context = contexts[index]
        removeContext(context, index)
      }
    } else if (diff > 0) {
      const styleStart = contexts.length - 1
      for (let i = 0; i < diff; i++) {
        const index = styleStart + 1 + i
        const style = styles[index]
        const context = createContext(style, index)
        contexts.push(context)
      }
    }
    return contexts
  }

  return {
    contexts,
    syncContexts
  }
}

export function createUIScene (tasks, state, renderer) {
  const { regl } = renderer

  const depth = {
    enable: false
  }

  const contexts = ['main', 'grid'].map((name, index) => {
    // TODO: Make bufferSize smallest possible for UI
    const bufferSize = 2 ** 10
    const lines = LineBuilder.create(regl, {
      dimensions: 2,
      bufferSize,
      drawArgs: {
        frag: linesUIFrag,
        depth
      }
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
