export function arc (ctx, x, y, radius, startAngle, endAngle, anticlockwise, precision_) {
  const delta = Math.abs(endAngle - startAngle)
  const dir = anticlockwise === true ? -1 : 1
  const precision = precision_ || Math.PI * 0.1
  const count = Math.ceil(delta / precision)

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const angle = startAngle + t * delta * dir
    const ax = x + Math.cos(angle) * radius
    const ay = y + Math.sin(angle) * radius

    if (i === 0) ctx.moveTo(ax, ay, 0)
    else ctx.lineTo(ax, ay, 0)
  }
}
