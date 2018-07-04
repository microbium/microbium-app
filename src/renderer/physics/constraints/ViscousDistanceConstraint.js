import { DistanceConstraint } from 'particulate'
import { inherit } from '@src/utils/ctor'

export { ViscousDistanceConstraint }

/**
  Modified Distance Constraint (2D)

  Applies viscous liquid oppositional force normal to member
*/

function ViscousDistanceConstraint (distance, a, b) {
  DistanceConstraint.call(this, distance, a, b)
  this.fluidFrictionFactor = 1.0 / (50 * 1000)
}

inherit(DistanceConstraint, ViscousDistanceConstraint, {
  applyConstraint (index, p0, p1) {
    const { indices, fluidFrictionFactor } = this
    const min2 = this._min2
    const max2 = this._max2

    const ai = indices[index]; const bi = indices[index + 1]
    const ax = ai * 3; const ay = ax + 1
    const bx = bi * 3; const by = bx + 1

    let dx = p0[bx] - p0[ax]
    let dy = p0[by] - p0[ay]

    if (!(dx || dy)) {
      dx = dy = 0.1
    }

    // OPTIM: Use non-sqrt approximations
    const dist2 = dx * dx + dy * dy
    const dist = Math.sqrt(dist2)
    const distInv = (1 / dist) || 0

    // Constrain particles to distance range
    if (dist2 > max2 || dist2 < min2) {
      const target2 = dist2 < min2 ? min2 : max2
      const diff = target2 / (dist2 + target2)
      const aDiff = diff - 0.5
      const bDiff = diff - 0.5

      p0[ax] -= dx * aDiff
      p0[ay] -= dy * aDiff
      p0[bx] += dx * bDiff
      p0[by] += dy * bDiff
    }

    // Segment unit length vector
    const udx = dx * distInv
    const udy = dy * distInv

    // Segment normal vector (2D)
    const ndx = udy
    const ndy = -udx

    // Particle movement vectors
    const velocityAX = p1[ax] - p0[ax]
    const velocityAY = p1[ay] - p0[ay]
    const velocityBX = p1[bx] - p0[bx]
    const velocityBY = p1[by] - p0[by]

    // TODO: Experiment with non-linear velocity factor (velocity^2 ?)
    // TODO: Investigate effect of variable particle weights on friction

    // Project particle movement onto normal as friction vector
    const velocityAT = ndx * velocityAX + ndy * velocityAY
    const velocityBT = ndx * velocityBX + ndy * velocityBY

    const factor = fluidFrictionFactor * dist
    const factorA = Math.min(5, Math.abs(Math.pow(velocityAT, 2))) * factor
    const factorB = Math.min(5, Math.abs(Math.pow(velocityBT, 2))) * factor
    const frictionAT = velocityAT * factorA
    const frictionBT = velocityBT * factorB

    const frictionAX = ndx * frictionAT
    const frictionAY = ndy * frictionAT
    const frictionBX = ndx * frictionBT
    const frictionBY = ndy * frictionBT

    p1[ax] -= frictionAX
    p1[ay] -= frictionAY
    p1[bx] -= frictionBX
    p1[by] -= frictionBY
  }
})
