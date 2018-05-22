import { Force } from 'particulate'
import { inherit } from '@src/utils/ctor'

export { RotatorForce }

function RotatorForce (position, opts) {
  opts = opts || {}
  Force.apply(this, arguments)
  this.intensity = opts.intensity || 0.05
  this.setRadius(opts.radius || 0)
}

inherit(Force, RotatorForce, {
  setRadius (r) {
    this.radius = r
  },

  applyForce (ix, f0, p0, p1) {
    const v0 = this.vector
    const iy = ix + 1
    const iz = ix + 2

    const radius = this.radius
    const intensity = this.intensity

    const dx = p0[ix] - v0[0]
    const dy = p0[iy] - v0[1]
    // const dz = p0[iz] - v0[2]

    const dist = Math.sqrt(dx * dx + dy * dy)
    const diff = dist - radius
    const isActive = dist > 0 && diff < 1
    if (!isActive) return

    const distInv = 1 / dist
    const nx = dx * distInv
    const ny = dy * distInv
    // const nz = dz * distInv

    const scale = diff / dist * intensity

    f0[ix] -= ny * scale
    f0[iy] += nx * scale
    f0[iz] += ny * scale
  }
})
