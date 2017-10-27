import basic from '@/shaders/basic.frag'
import postFX from '@/shaders/post-fx.vert'

export function createDrawRect (regl) {
  return regl({
    frag: basic,
    vert: postFX,
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
