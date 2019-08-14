import { vec2 } from 'gl-matrix'
import { radialPosition } from '@renderer/utils/math'
import { arc } from './primitive'

const { PI } = Math
const scratchVec2A = vec2.create()
const scratchVec2B = vec2.create()

export function drawSimulatorUI (state, ctx) {
  if (!state.simulation.isRunning) return
  const { tick, isRunning } = state.simulation
  const { center, size } = state.viewport
  const { overlay } = state.controls.viewport

  const offsetA = 6 + Math.sin(tick * 0.02) * 2
  const offsetB = 10 + Math.sin(tick * 0.02) * 2

  ctx.save()
  ctx.translate(-center[0], -center[1], 0)

  ctx.globalAlpha = (isRunning ? overlay.alphaFactor : 1) * 0.8
  ctx.strokeStyle = overlay.colorHighlightHex

  ctx.lineWidth = 3
  ctx.strokeRect(offsetA, offsetA,
    size[0] - offsetA * 2, size[1] - offsetA * 2)

  ctx.lineWidth = 0.5
  ctx.strokeRect(offsetB, offsetB,
    size[0] - offsetB * 2, size[1] - offsetB * 2)

  ctx.restore()
}

export function drawSimulatorForces (
  state, ctx, baseRadius, alpha,
  positionType = 0, renderTicker = false
) {
  const { tick, isRunning } = state.simulation
  const { forces } = state.controls
  const { scale } = state.viewport
  const { overlay } = state.controls.viewport
  const simulationPoints = state.simulationForces && state.simulationForces.points
  const scaleInv = 1 / scale

  forces.forEach(({ positionTypeIndex, polarAngle, polarOffset, intensity, radius }, i) => {
    if (positionTypeIndex !== positionType) return

    let position
    if (isRunning) {
      const point = simulationPoints[i]
      position = point.position
      intensity = point.force.intensity
    } else {
      const offset = vec2.set(scratchVec2A, polarOffset * polarOffset, 0)
      position = radialPosition(scratchVec2B, offset, polarAngle / 180 * PI)
    }

    ctx.save()
    ctx.translate(position[0], position[1], 0)

    ctx.globalAlpha = (isRunning ? overlay.alphaFactor : 1) * alpha
    ctx.strokeStyle = '#ffffff'

    ctx.lineWidth = 1.5 * scaleInv
    ctx.beginPath()
    arc(ctx,
      0, 0, baseRadius + intensity * 1.5,
      0, Math.PI * 2 - Math.PI * 0.2,
      false, Math.PI * 0.2)
    ctx.closePath()
    ctx.stroke()

    ctx.lineWidth = 1 * scaleInv
    ctx.beginPath()
    arc(ctx,
      0, 0, baseRadius + intensity * 1.5 + 4,
      0, Math.PI * 2 - Math.PI * 0.2,
      false, Math.PI * 0.2)
    ctx.closePath()
    ctx.stroke()

    if (renderTicker) {
      ctx.lineWidth = 1 * scaleInv
      ctx.beginPath()
      arc(ctx,
        0, 0,
        baseRadius + 2 + Math.sin(tick * 0.05) * 6,
        0, Math.PI * 2 - Math.PI * 0.2,
        false, Math.PI * 0.2)
      ctx.closePath()
      ctx.stroke()
    }

    ctx.restore()
  })
}

export function drawSimulatorForcesTick (state, ctx, baseRadius, alpha) {
  drawSimulatorForces(state, ctx, baseRadius, alpha, 0, true)
}

export function drawSimulatorPointerForces (state, ctx, baseRadius, alpha) {
  drawSimulatorForces(state, ctx, baseRadius, alpha, 1, false)
  drawSimulatorForces(state, ctx, baseRadius, alpha, 2, false)
}
