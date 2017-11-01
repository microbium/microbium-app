import { LINE_WIDTH } from '@/constants/line-styles'
import { UI_PALETTE } from '@/constants/color-palettes'
import { map, flatten2 } from '@/utils/array'

export function drawGeometry (state, contexts, segmentStart, segmentCount) {
  drawSegments(state, contexts, segmentStart, segmentCount)
  drawSegmentsCurves(state, contexts, segmentStart, segmentCount)
}

export function drawSegments (state, contexts, segmentStart_, segmentCount_) {
  const { segments, vertices } = state.geometry
  const { curveSubDivisions } = state.controls
  const segmentStart = segmentStart_ || 0
  const segmentCount = segmentCount_ || segments.length

  for (let s = segmentStart; s < segmentCount; s++) {
    const segment = segments[s]
    const {
      indices, isClosed,
      lineWidths, lineStyleIndex, lineColor, lineAlpha
    } = segment

    const count = isClosed ? indices.length - 1 : indices.length
    if (count < 2) continue

    const { ctx } = contexts[lineStyleIndex]
    const curvePrecision = segment.curvePrecision * curveSubDivisions
    const lineWidthBase = curvePrecision <= 1
      ? LINE_WIDTH[segment.lineWidthBase]
      : LINE_WIDTH.THIN

    ctx.globalAlpha = (curvePrecision <= 1 ? 1 : 0.5) * lineAlpha
    ctx.strokeStyle = lineColor
    ctx.beginPath()

    for (let i = 0; i < count; i++) {
      const index = indices[i]
      const point = vertices[index]
      const lineWidth = lineWidths[i]
      ctx.lineWidth = lineWidthBase * lineWidth
      if (i === 0) ctx.moveTo(point[0], point[1])
      else ctx.lineTo(point[0], point[1])
    }
    if (isClosed) {
      ctx.closePath()
      // ctx.fill()
    }
    ctx.stroke()
  }
}

export function drawSegmentsCurves (state, contexts, segmentStart_, segmentCount_) {
  const { segments, vertices } = state.geometry
  const { curveSubDivisions } = state.controls
  const segmentStart = segmentStart_ || 0
  const segmentCount = segmentCount_ || segments.length

  for (let s = segmentStart; s < segmentCount; s++) {
    const segment = segments[s]
    const {
      indices, isClosed,
      lineWidths, lineStyleIndex, lineColor, lineAlpha
    } = segment

    const count = isClosed ? indices.length - 1 : indices.length
    const curvePrecision = segment.curvePrecision * curveSubDivisions
    if (count < 2 || curvePrecision <= 1) continue

    const { ctx } = contexts[lineStyleIndex]
    const lineWidthBase = LINE_WIDTH[segment.lineWidthBase]
    const points = map(indices, (i) => vertices[i])
    const pointsFlat = flatten2(points)

    // FIXME: Closed curve segments have a noticeable gap
    if (isClosed) pointsFlat.splice(-2, 2)

    ctx.globalAlpha = lineAlpha
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidthBase * lineWidths[0]

    ctx.beginPath()
    ctx.moveTo(pointsFlat[0], pointsFlat[1])
    ctx.curve(pointsFlat,
      lineWidths, lineWidthBase,
      0.5, curvePrecision, isClosed)

    if (isClosed) {
      ctx.closePath()
      // ctx.fill()
    }

    ctx.stroke()
  }
}

export function drawFocus (state, ctx, index) {
  const { vertices } = state.geometry
  const point = vertices[index]
  if (!point) return

  ctx.globalAlpha = 0.8
  ctx.strokeStyle = UI_PALETTE.HI_PRIMARY
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(point[0], point[1], 6, 0, Math.PI * 2)
  ctx.stroke()

  ctx.globalAlpha = 0.05
  ctx.strokeStyle = UI_PALETTE.HI_SECONDARY
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(point[0], point[1], 18, 0, Math.PI * 2)
  ctx.stroke()
}
