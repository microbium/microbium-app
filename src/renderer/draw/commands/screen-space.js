import basicFrag from '@/shaders/basic.frag'
import postFXVert from '@/shaders/post-fx.vert'
import postFXFrag from '@/shaders/post-fx.frag'
import postFXHashBlurFrag from '@/shaders/post-fx-hash-blur.frag'

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

export function createDrawHashBlur (regl) {
  return regl({
    frag: postFXHashBlurFrag,
    uniforms: {
      color: regl.prop('color'),
      radius: regl.prop('radius'),
      offset: regl.prop('offset'),
      resolution: (context, {width, height}) => [width, height]
    }
  })
}

export function createDrawScreen (regl) {
  return regl({
    frag: postFXFrag,
    uniforms: {
      color: regl.prop('color'),
      bloom: regl.prop('bloom'),
      bloomIntensity: regl.prop('bloomIntensity')
    }
  })
}
