import { UI_PALETTE } from '@/constants/color-palettes'

const { PI } = Math

export function drawSimulatorUI (state, ctx) {
  if (!state.simulation.isRunning) return
  const { tick } = state.simulation
  const { center, size } = state.viewport

  const offsetA = 6 + Math.sin(tick * 0.02) * 2
  const offsetB = 10 + Math.sin(tick * 0.02) * 2

  ctx.save()
  ctx.translate(-center[0], -center[1])

  ctx.globalAlpha = 0.8
  ctx.strokeStyle = UI_PALETTE.BACK_PRIMARY

  ctx.lineWidth = 3
  ctx.strokeRect(offsetA, offsetA,
    size[0] - offsetA * 2, size[1] - offsetA * 2)

  ctx.lineWidth = 0.5
  ctx.strokeRect(offsetB, offsetB,
    size[0] - offsetB * 2, size[1] - offsetB * 2)

  ctx.restore()
}

// TODO: Redesign simulator origin UI
export function drawSimulatorOriginUI (state, ctx) {
  // if (!state.simulation.isRunning) return
  // const { diffusor, rotator } = state.simulationForces

  // ctx.save()
  // ctx.globalAlpha = 0.8

  // ctx.strokeStyle = UI_PALETTE.BACK_PRIMARY
  // ctx.lineWidth = 1.5
  // ctx.beginPath()
  // ctx.arc(0, 0, 14, 0, -rotator.intensity * 100 * PI, rotator.intensity > 0)
  // ctx.stroke()

  // ctx.strokeStyle = UI_PALETTE.BACK_SECONDARY
  // ctx.lineWidth = 1
  // ctx.beginPath()
  // ctx.arc(0, 0, 14 + diffusor.intensity * 100 * 8, 0, PI * 2)
  // ctx.stroke()

  // ctx.restore()
}

// TODO: Redesign configurable forces UI
export function drawSimulatorForceUI (state, ctx, baseRadius, alpha) {
  if (!state.simulation.isRunning) return
  const { points } = state.simulationForces

  ctx.save()
  ctx.globalAlpha = 0.8 * alpha
  ctx.strokeStyle = UI_PALETTE.BACK_PRIMARY

  points.forEach(({position, force}) => {
    const { intensity } = force

    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(position[0], position[1],
      baseRadius + intensity * 1.5,
      0, PI * 2)
    ctx.stroke()
  })

  ctx.restore()
}
