import { DistanceConstraint } from 'particulate'
import { inherit } from '@src/utils/ctor'

export { ViscousDistanceConstraint }

/**
  Modified Distance Constraint (2D)

  Applies viscous liquid oppositional force normal to member
*/

function ViscousDistanceConstraint (distance, a, b) {
  DistanceConstraint.call(this, distance, a, b)
}

inherit(DistanceConstraint, ViscousDistanceConstraint, {
  applyConstraint (index, p0, p1) {
    const ii = this.indices
    const ai = ii[index]; const bi = ii[index + 1]

    const ax = ai * 3; const ay = ax + 1
    const bx = bi * 3; const by = bx + 1

    let dx = p0[bx] - p0[ax]
    let dy = p0[by] - p0[ay]

    if (!(dx || dy)) {
      dx = dy = 0.1
    }

    const dist2 = dx * dx + dy * dy
    const min2 = this._min2
    const max2 = this._max2

    // OPTIM: Use non-sqrt approximations
    const dist = Math.sqrt(dist2)
    const distInv = 1 / dist

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

    const udx = dx * distInv
    const udy = dy * distInv

    // Normal vectors (2D)
    const ndx = udy
    const ndy = -udx

    // Particle movement vectors
    const moveAx = p1[ax] - p0[ax]
    const moveAy = p1[ay] - p0[ay]
    const moveBx = p1[bx] - p0[bx]
    const moveBy = p1[by] - p0[by]

    // Project particle movement onto normal as friction vector
    const moveAt = ndx * moveAx + ndy * moveAy
    const moveBt = ndx * moveBx + ndy * moveBy
    const fricAx = ndx * moveAt
    const fricAy = ndy * moveAt
    const fricBx = ndx * moveBt
    const fricBy = ndy * moveBt

    // Friction factor
    const factor = 0.06

    p1[ax] -= fricAx * factor
    p1[ay] -= fricAy * factor
    p1[bx] -= fricBx * factor
    p1[by] -= fricBy * factor
  }
})
