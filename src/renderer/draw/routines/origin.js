export function drawOrigin (state, ctx) {
  const size = 6

  ctx.save()
  ctx.globalAlpha = 0.8
  ctx.strokeStyle = '#222222'
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(0, size)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-size, 0)
  ctx.lineTo(size, 0)
  ctx.stroke()

  ctx.restore()
}

export function drawOriginTick (state, ctx) {
  const { tick } = state.simulation

  ctx.save()
  ctx.globalAlpha = 0.8
  ctx.strokeStyle = '#222222'
  ctx.lineWidth = 2
  ctx.rotate(tick * 0.02)

  ctx.beginPath()
  ctx.arc(0, 0, 8, 0, Math.PI * 0.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 8, Math.PI, Math.PI * 1.5)
  ctx.stroke()

  ctx.restore()
}
