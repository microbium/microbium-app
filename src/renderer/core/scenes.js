import { LineBuilder } from 'regl-line-builder'

import { curve, polyline } from '@renderer/utils/draw'

import linesEntitiesVert from '@renderer/shaders/lines-entities.vert'
import linesEntitiesFrag from '@renderer/shaders/lines-entities.frag'
import fillsEntitiesVert from '@renderer/shaders/fills-entities.vert'
import fillsEntitiesFrag from '@renderer/shaders/fills-entities.frag'
import linesUIFrag from '@renderer/shaders/lines-ui.frag'

export function createScene (tasks, state, renderer) {
  const { regl, textures } = renderer

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
    enable: regl.prop('depthRead'),
    mask: regl.prop('depthWrite'),
    func: 'less',
    range: [0, 1]
  }

  const lineAlphaMapOpts = {
    format: 'rgb',
    min: 'linear',
    mag: 'linear',
    wrap: 'clamp'
  }
  const fillAlphaMapOpts = {
    format: 'rgb',
    min: 'linear',
    mag: 'linear',
    wrap: 'clamp'
  }
  const depthMapOpts = {
    format: 'rgb',
    min: 'linear',
    mag: 'linear',
    wrap: 'clamp'
  }

  /*
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
  */

  // OPTIM: Investigate huge perf issues in Chrome when using instancing
  // OPTIM: Optimize shared state between contexts
  const contexts = []

  function createContext (style, index) {
    const bufferSize = 512

    const uniforms = {
      tick: regl.prop('tick'),
      mirror: regl.prop('mirror'),
      depth: regl.prop('depth'),
      depthMap: (params, { depthMapName, depthMapPath }) =>
        (textures.get(depthMapName, depthMapPath, depthMapOpts)),
      useDepthMap: (params, { depthMapPath }) =>
        (depthMapPath == null ? 0 : 1),
      depthMapParams: regl.prop('depthMapParams'),
      angle: regl.prop('angle'),
      angleAlpha: regl.prop('angleAlpha')
    }

    const lines = LineBuilder.create(regl, {
      dimensions: 3,
      bufferSize,

      drawLineArgs: {
        vert: linesEntitiesVert,
        frag: linesEntitiesFrag,
        // instances: (context, { angles }) => angles.length,
        uniforms: {
          ...uniforms,
          tint: regl.prop('lineTint'),
          dashFunction: regl.prop('lineDashFunction'),
          alphaMapRepeat: regl.prop('lineAlphaMapRepeat'),
          alphaMap: (params, { lineAlphaMapName, lineAlphaMapPath }) =>
            (textures.get(lineAlphaMapName, lineAlphaMapPath, lineAlphaMapOpts)),
          useAlphaMap: (params, { lineAlphaMapPath }) =>
            (lineAlphaMapPath == null ? 0 : 1)
        },
        // attributes,
        blend,
        depth
      },

      drawFillArgs: {
        vert: fillsEntitiesVert,
        frag: fillsEntitiesFrag,
        // instances: (context, { angles }) => angles.length,
        uniforms: {
          ...uniforms,
          tint: regl.prop('fillTint'),
          dashFunction: regl.prop('fillDashFunction'),
          alphaMapRepeat: regl.prop('fillAlphaMapRepeat'),
          alphaMap: (params, { fillAlphaMapName, fillAlphaMapPath }) =>
            (textures.get(fillAlphaMapName, fillAlphaMapPath, fillAlphaMapOpts)),
          useAlphaMap: (params, { fillAlphaMapPath }) =>
            (fillAlphaMapPath == null ? 0 : 1)
        },
        // attributes,
        blend,
        depth,
        cull: {
          enable: false,
          face: 'front'
        }
      }
    })

    const ctx = lines.getContext('3d')
    ctx.curve = curve.bind(ctx)
    ctx.polyline = polyline.bind(ctx)

    return {
      bufferSize,
      bufferInterval: bufferSize,
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

  function resetLines () {
    for (let i = 0; i < contexts.length; i++) {
      const { lines } = contexts[i]
      lines.reset()
    }
  }

  return {
    contexts,
    syncContexts,
    resetLines
  }
}

export function createUIScene (tasks, state, renderer) {
  const { regl } = renderer

  const depth = {
    enable: false
  }

  const contexts = ['main', 'grid'].map((name, index) => {
    // TODO: Make bufferSize smallest possible for UI
    const bufferSize = 1024
    const lines = LineBuilder.create(regl, {
      dimensions: 3,
      bufferSize,
      drawLineArgs: {
        frag: linesUIFrag,
        depth
      },
      drawFillArgs: {
        cull: { enable: false }
      }
    })

    const ctx = lines.getContext('3d')
    ctx.curve = curve.bind(ctx)

    return {
      bufferSize,
      index,
      name,
      lines,
      ctx
    }
  })

  function resetLines () {
    for (let i = 0; i < contexts.length; i++) {
      const { lines } = contexts[i]
      lines.reset()
    }
  }

  return {
    contexts,
    resetLines,
    main: contexts[0],
    grid: contexts[1]
  }
}
