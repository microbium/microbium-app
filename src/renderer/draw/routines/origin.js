const { PI } = Math

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
  ctx.arc(0, 0, 8, 0, PI * 0.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 8, PI, PI * 1.5)
  ctx.stroke()

  ctx.restore()
}

export function drawPolarGrid (state, ctx) {
  const radialOffsets = [100, 400]
  const polarIterations = [8, 30]
  const tickSizes = [4, 8]

  ctx.save()
  ctx.globalAlpha = 0.6

  for (let i = 0; i < radialOffsets.length; i++) {
    const radius = radialOffsets[i]
    const polarSteps = polarIterations[i]
    const tickSize = tickSizes[i]
    const angleStep = PI * 2 / polarSteps

    ctx.lineWidth = i + 1

    for (let j = 0; j < polarSteps; j++) {
      const isEven = j % 2 === 0
      const length = isEven ? tickSize : tickSize * 2
      ctx.strokeStyle = isEven ? '#58BAA4' : '#222222'
      ctx.beginPath()
      ctx.moveTo(0, radius - length)
      ctx.lineTo(0, radius + length)
      ctx.stroke()
      ctx.rotate(angleStep)
    }
  }

  ctx.restore()
}
