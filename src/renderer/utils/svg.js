export function pointsAttr (points) {
  return points.map((v) => v.join(',')).join(' ')
}

export function pointsCircle (precision, x, y, radius) {
  return pointsAttr((new Array(precision))
    .fill(0)
    .map((n, i) => {
      const angle = i / precision * Math.PI * 2
      const px = Math.cos(angle) * radius
      const py = Math.sin(angle) * radius
      return [x + px, y + py]
    }))
}
