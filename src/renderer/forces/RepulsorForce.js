import {
  Force,
  inherit
} from 'particulate'

export { RepulsorForce }

function RepulsorForce (position, opts) {
  opts = opts || {}
  Force.apply(this, arguments)
  this.intensity = opts.intensity || 0.05
  this.setRadius(opts.radius || 0)
}

inherit(RepulsorForce, Force)

RepulsorForce.prototype.setRadius = function (r) {
  this.radiusSq = r * r
}

RepulsorForce.prototype.applyForce = function (ix, f0, p0, p1) {
  const v0 = this.vector
  const iy = ix + 1
  const iz = ix + 2

  const dx = p0[ix] - v0[0]
  const dy = p0[iy] - v0[1]
  const dz = p0[iz] - v0[2]

  const radiusSq = this.radiusSq
  const distSqXY = dx * dx + dy * dy
  const diffSqXY = distSqXY - radiusSq
  const isActive = distSqXY > 0 && diffSqXY < 1
  if (!isActive) return

  const dist = Math.sqrt(distSqXY + dz * dz)
  const intensity = this.intensity

  const distInv = 1 / dist
  const nx = dx * distInv
  const ny = dy * distInv
  const nz = dz * distInv

  f0[ix] += nx * intensity
  f0[iy] += ny * intensity
  f0[iz] += nz * intensity * 0.2
}
