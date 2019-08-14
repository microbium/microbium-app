import cardinalSplineCurve from 'cardinal-spline'
import { lerp } from '@renderer/utils/math'

const { max } = Math

export function curve (points, depths,
  strokeWidth, strokeWidthMod, strokeWidths,
  tension, segmentsCount, isClosed
) {
  const spline = cardinalSplineCurve(points, tension, segmentsCount, isClosed)
  const count = (isClosed ? spline.length - 2 : spline.length) / 2

  for (let i = 0; i < count; i++) {
    const ix = i * 2
    const iy = ix + 1
    const iwt = i / segmentsCount
    const iw = Math.floor(iwt)

    const depth = lerp(depths[iw], depths[iw + 1], iwt - iw)
    const lineWidthSeg = lerp(strokeWidths[iw], strokeWidths[iw + 1], iwt - iw)
    const lineWidth = strokeWidth + strokeWidth * strokeWidthMod * lineWidthSeg

    this.lineWidth = max(0, lineWidth)

    if (i === 0) this.moveTo(spline[ix], spline[iy], depth)
    else this.lineTo(spline[ix], spline[iy], depth)
  }

  return spline
}

export function polyline (points, depths,
  strokeWidth, strokeWidthMod, strokeWidths,
  isClosed
) {
  const count = (isClosed ? points.length - 1 : points.length) / 2

  for (let i = 0; i < count; i++) {
    const ix = i * 2
    const iy = ix + 1

    const depth = depths[i]
    const lineWidthSeg = strokeWidths[i]
    const lineWidth = strokeWidth + strokeWidth * strokeWidthMod * lineWidthSeg

    this.lineWidth = max(0, lineWidth)

    if (i === 0) this.moveTo(points[ix], points[iy], depth)
    else this.lineTo(points[ix], points[iy], depth)
  }
}
