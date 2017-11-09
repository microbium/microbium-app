import cardinalSplineCurve from 'cardinal-spline'
import { lerp } from '@/utils/math'

export function curve (points,
  strokeWidth, strokeWidthMod, strokeWidths,
  tension, segmentsCount, isClosed
) {
  const spline = cardinalSplineCurve(points, tension, segmentsCount, isClosed)
  const count = spline.length / 2

  for (let i = 0; i < count; i++) {
    const ix = i * 2
    const iwt = i / segmentsCount
    const iw = Math.floor(iwt)
    const strokeWidthSeg = lerp(strokeWidths[iw], strokeWidths[iw + 1], iwt - iw)

    this.lineWidth = strokeWidth + strokeWidth * strokeWidthMod * strokeWidthSeg
    this.lineTo(spline[ix], spline[ix + 1])
  }

  return spline
}
