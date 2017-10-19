import cardinalSplineCurve from 'cardinal-spline'

export function curve (points, tension, segments, isClosed) {
  const spline = cardinalSplineCurve(points, tension, segments, isClosed)
  for (let i = 0; i < spline.length; i += 2) {
    this.lineTo(spline[i], spline[i + 1])
  }
  return spline
}
