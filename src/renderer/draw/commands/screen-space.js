import injectDefines from 'glsl-inject-defines'

import basicFrag from '@src/shaders/basic.frag'
import postFXVert from '@src/shaders/post-fx.vert'
import postFXFrag from '@src/shaders/post-fx.frag'
import postFXCopy from '@src/shaders/post-fx-copy.frag'
import postFXBoxBlurFrag from '@src/shaders/post-fx-box-blur.frag'
import postFXGaussBlurFrag from '@src/shaders/post-fx-gaussian-blur.frag'
import postFXHashBlurFrag from '@src/shaders/post-fx-hash-blur.frag'
import postFXBanding from '@src/shaders/post-fx-banding.frag'
import postFXEdges from '@src/shaders/post-fx-edges.frag'
import postFXMirror from '@src/shaders/post-fx-mirror.frag'

export function createDrawRect (regl) {
  return regl({
    frag: basicFrag,
    vert: postFXVert,
    attributes: {
      position: [-4, -4, 4, -4, 0, 4]
    },
    count: 3,
    blend: {
      enable: true,
      equation: 'add',
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha'
      }
    },
    depth: { enable: false },
    uniforms: {
      color: regl.prop('color')
    }
  })
}

export function createSetupDrawScreen (regl) {
  return regl({
    vert: postFXVert,
    attributes: {
      position: [-4, -4, 4, -4, 0, 4]
    },
    count: 3,
    depth: { enable: false }
  })
}

export function createDrawTexture (regl) {
  return regl({
    frag: postFXCopy,
    uniforms: {
      color: regl.prop('color')
    }
  })
}

export function createDrawBoxBlur (regl, params = {}) {
  const defines = {
    BLUR_RADIUS: params.radius || 1
  }
  return regl({
    frag: injectDefines(postFXBoxBlurFrag, defines),
    uniforms: {
      color: regl.prop('color'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawGaussBlur (regl) {
  return regl({
    frag: postFXGaussBlurFrag,
    uniforms: {
      color: regl.prop('color'),
      blurDirection: regl.prop('blurDirection'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawHashBlur (regl) {
  return regl({
    frag: postFXHashBlurFrag,
    uniforms: {
      color: regl.prop('color'),
      radius: regl.prop('radius'),
      offset: regl.prop('offset'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawBanding (regl) {
  return regl({
    frag: postFXBanding,
    uniforms: {
      color: regl.prop('color'),
      bandingStep: regl.prop('bandingStep'),
      tick: regl.prop('tick')
    }
  })
}

export function createDrawEdges (regl) {
  return regl({
    frag: postFXEdges,
    uniforms: {
      color: regl.prop('color'),
      thickness: regl.prop('thickness'),
      tick: regl.prop('tick'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawMirror (regl) {
  return regl({
    frag: postFXMirror,
    uniforms: {
      color: regl.prop('color'),
      viewResolution: regl.prop('viewResolution')
    }
  })
}

export function createDrawScreen (regl) {
  return regl({
    frag: postFXFrag,
    uniforms: {
      color: regl.prop('color'),
      colorShift: regl.prop('colorShift'),
      bloom: regl.prop('bloom'),
      bloomIntensity: regl.prop('bloomIntensity'),
      banding: regl.prop('banding'),
      bandingIntensity: regl.prop('bandingIntensity'),
      edges: regl.prop('edges'),
      edgesIntensity: regl.prop('edgesIntensity'),
      noiseIntensity: regl.prop('noiseIntensity'),
      tick: regl.prop('tick'),
      viewResolution: regl.prop('viewResolution'),
      viewOffset: regl.prop('viewOffset')
    }
  })
}
