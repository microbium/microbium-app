export function pointsAttr (points) {
  return points.map((v) => v.join(',')).join(' ')
}

export function pointsCircle (precision, x, y, radius) {
  return pointsArc(precision, x, y, radius, 0, Math.PI * 2)
}

export function pointsArc (precision, x, y, radius, angleStart, angleEnd) {
  const angleDelta = angleEnd - angleStart
  return pointsAttr((new Array(precision))
    .fill(0)
    .map((n, i) => {
      const angle = angleStart + i / precision * angleDelta
      const px = Math.cos(angle) * radius
      const py = Math.sin(angle) * radius
      return [x + px, y + py]
    }))
}
