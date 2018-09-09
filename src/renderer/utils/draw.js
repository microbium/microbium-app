import cardinalSplineCurve from 'cardinal-spline'
import { lerp } from '@src/utils/math'

const { max } = Math

export function curve (points,
  strokeWidth, strokeWidthMod, strokeWidths,
  tension, segmentsCount, isClosed
) {
  const spline = cardinalSplineCurve(points, tension, segmentsCount, isClosed)
  const count = (isClosed ? spline.length - 2 : spline.length) / 2

  for (let i = 0; i < count; i++) {
    const ix = i * 2
    const iwt = i / segmentsCount
    const iw = Math.floor(iwt)

    const lineWidthSeg = lerp(strokeWidths[iw], strokeWidths[iw + 1], iwt - iw)
    const lineWidth = strokeWidth + strokeWidth * strokeWidthMod * lineWidthSeg

    this.lineWidth = max(0, lineWidth)

    if (i === 0) this.moveTo(spline[ix], spline[ix + 1])
    else this.lineTo(spline[ix], spline[ix + 1])
  }

  return spline
}

export function polyline (points,
  strokeWidth, strokeWidthMod, strokeWidths,
  isClosed
) {
  const count = (isClosed ? points.length - 1 : points.length) / 2

  for (let i = 0; i < count; i++) {
    const ix = i * 2
    const iy = ix + 1

    const lineWidthSeg = strokeWidths[i]
    const lineWidth = strokeWidth + strokeWidth * strokeWidthMod * lineWidthSeg

    this.lineWidth = max(0, lineWidth)

    if (i === 0) this.moveTo(points[ix], points[iy])
    else this.lineTo(points[ix], points[iy])
  }
}
