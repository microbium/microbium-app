import injectDefines from 'glsl-inject-defines'

import basicFrag from '@renderer/shaders/basic.frag'
import postFXVert from '@renderer/shaders/post-fx.vert'
import postFXFrag from '@renderer/shaders/post-fx.frag'
import postFXCopyVert from '@renderer/shaders/post-fx-copy.vert'
import postFXCopyFrag from '@renderer/shaders/post-fx-copy.frag'
import postFXBoxBlurFrag from '@renderer/shaders/post-fx-box-blur.frag'
import postFXGaussBlurFrag from '@renderer/shaders/post-fx-gaussian-blur.frag'
import postFXHashBlurFrag from '@renderer/shaders/post-fx-hash-blur.frag'
import postFXBanding from '@renderer/shaders/post-fx-banding.frag'
import postFXEdges from '@renderer/shaders/post-fx-edges.frag'
import postFXFeedbackVert from '@renderer/shaders/post-fx-feedback.vert'
import postFXFeedbackFrag from '@renderer/shaders/post-fx-feedback.frag'

const SCREEN_EFFECT = {
  vert: postFXVert,
  attributes: {
    position: new Float32Array([-4, -4, 4, -4, 0, 4])
  },
  count: 3,
  depth: { enable: false }
}

export function createDrawRect (regl) {
  return regl({
    ...SCREEN_EFFECT,
    frag: basicFrag,
    blend: {
      enable: true,
      equation: 'add',
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha'
      }
    },
    uniforms: {
      color: regl.prop('color')
    }
  })
}

export function createSetupDrawScreen (regl) {
  return regl({
    ...SCREEN_EFFECT
  })
}

export function createDrawTexture (regl, postBuffers) {
  return regl({
    ...SCREEN_EFFECT,
    vert: postFXCopyVert,
    frag: postFXCopyFrag,
    framebuffer: (context, props) => getFramebuffer(postBuffers, props.framebufferName),
    uniforms: {
      color: (context, props) => getFramebuffer(postBuffers, props.colorName),
      scale: regl.prop('scale'),
      offset: regl.prop('offset')
    }
  })
}

export function createDrawFeedback (regl, postBuffers, textures) {
  return regl({
    ...SCREEN_EFFECT,
    vert: postFXFeedbackVert,
    frag: postFXFeedbackFrag,
    framebuffer: (context, props) => getFramebuffer(postBuffers, props.framebufferName),
    uniforms: {
      color: (context, props) => getFramebuffer(postBuffers, props.colorName),
      displace: (params, { displaceName, displacePath }) =>
        (textures.get(displaceName, displacePath)),
      useDisplace: (params, { displacePath }) =>
        (displacePath == null ? 0 : 1),
      displaceOffset: regl.prop('displaceOffset'),
      scale: regl.prop('scale'),
      offset: regl.prop('offset')
    }
  })
}

export function createDrawBoxBlur (regl, params = {}) {
  const defines = {
    BLUR_RADIUS: params.radius || 1
  }
  return regl({
    ...SCREEN_EFFECT,
    frag: injectDefines(postFXBoxBlurFrag, defines),
    uniforms: {
      color: regl.prop('color'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawGaussBlur (regl, postBuffers) {
  return regl({
    ...SCREEN_EFFECT,
    frag: postFXGaussBlurFrag,
    framebuffer: (context, props) => getFramebuffer(postBuffers, props.framebufferName),
    uniforms: {
      color: (context, props) => getFramebuffer(postBuffers, props.colorName),
      blurDirection: regl.prop('blurDirection'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawHashBlur (regl) {
  return regl({
    ...SCREEN_EFFECT,
    frag: postFXHashBlurFrag,
    uniforms: {
      color: regl.prop('color'),
      radius: regl.prop('radius'),
      offset: regl.prop('offset'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawBanding (regl, postBuffers) {
  return regl({
    ...SCREEN_EFFECT,
    frag: postFXBanding,
    framebuffer: (context, props) => getFramebuffer(postBuffers, props.framebufferName),
    uniforms: {
      color: (context, props) => getFramebuffer(postBuffers, props.colorName),
      bandingStep: regl.prop('bandingStep'),
      tick: regl.prop('tick')
    }
  })
}

export function createDrawEdges (regl, postBuffers) {
  return regl({
    ...SCREEN_EFFECT,
    frag: postFXEdges,
    framebuffer: (context, props) => getFramebuffer(postBuffers, props.framebufferName),
    uniforms: {
      color: (context, props) => getFramebuffer(postBuffers, props.colorName),
      thickness: regl.prop('thickness'),
      repeat: regl.prop('repeat'),
      tick: regl.prop('tick'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawScreen (regl, postBuffers) {
  return regl({
    ...SCREEN_EFFECT,
    frag: postFXFrag,
    framebuffer: (context, props) => getFramebuffer(postBuffers, props.framebufferName),
    uniforms: {
      color: (context, props) => getFramebuffer(postBuffers, props.colorName),
      bloom: (context, props) => getFramebuffer(postBuffers, props.bloomName),
      banding: (context, props) => getFramebuffer(postBuffers, props.bandingName),
      edges: (context, props) => getFramebuffer(postBuffers, props.edgesName),
      lutTexture: regl.prop('lutTexture'),
      watermarkTexture: regl.prop('watermarkTexture'),
      colorShift: regl.prop('colorShift'),
      mirrorIntensity: regl.prop('mirrorIntensity'),
      mirrorAngle: regl.prop('mirrorAngle'),
      bandingIntensity: regl.prop('bandingIntensity'),
      edgesIntensity: regl.prop('edgesIntensity'),
      noiseIntensity: regl.prop('noiseIntensity'),
      lutIntensity: regl.prop('lutIntensity'),
      watermarkIntensity: regl.prop('watermarkIntensity'),
      overlayAlpha: regl.prop('overlayAlpha'),
      originAlpha: regl.prop('originAlpha'),
      vignetteParams: regl.prop('vignetteParams'),
      defocusParams: regl.prop('defocusParams'),
      tick: regl.prop('tick'),
      viewResolution: regl.prop('viewResolution'),
      viewOffset: regl.prop('viewOffset'),
      viewScale: regl.prop('viewScale')
    }
  })
}

function getFramebuffer (postBuffers, name) {
  if (!name) return null
  return postBuffers.get(name)
}

/*
function createArrayUniformProps (name, count, defaultValue) {
  const props = {}
  for (let i = 0; i < count; i++) {
    props[`${name}[${i}]`] = (context, props) => {
      return props[name][i] || defaultValue
    }
  }
  props[`${name}Count`] = (context, props) => props[name].length
  return props
}
*/
