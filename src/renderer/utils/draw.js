import cardinalSplineCurve from 'cardinal-spline'
import { lerp } from '@/utils/math'

export function curve (points,
  lineWidths, lineWidthBase,
  tension, segmentsCount, isClosed
) {
  const spline = cardinalSplineCurve(points, tension, segmentsCount, isClosed)
  const count = spline.length / 2

  for (let i = 0; i < count; i++) {
    const ix = i * 2
    const iwt = i / segmentsCount
    const iw = Math.floor(iwt)
    const lineWidth = lerp(lineWidths[iw], lineWidths[iw + 1], iwt - iw)

    this.lineWidth = lineWidthBase * lineWidth
    this.lineTo(spline[ix], spline[ix + 1])
  }

  return spline
}
