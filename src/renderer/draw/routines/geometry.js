import { UI_PALETTE } from '@/constants/color-palettes'
import { map, flatten2 } from '@/utils/array'

const { PI } = Math

export function drawGeometry (state, contexts, segmentStart, segmentCount) {
  drawSegments(state, contexts, segmentStart, segmentCount)
  drawSegmentsCurves(state, contexts, segmentStart, segmentCount)
}

export function drawSegments (state, contexts, segmentStart_, segmentCount_) {
  const { segments, vertices } = state.geometry
  const { styles } = state.controls
  const { curveSubDivisions } = state.controls.modifiers
  const segmentStart = segmentStart_ || 0
  const segmentCount = segmentCount_ || segments.length

  for (let s = segmentStart; s < segmentCount; s++) {
    const segment = segments[s]
    const {
      indices, isClosed, styleIndex,
      strokeWidthModulations, strokeColor, strokeAlpha
    } = segment

    const count = isClosed ? indices.length - 1 : indices.length
    if (count < 2) continue

    const { ctx } = contexts[styleIndex]
    const { strokeWidthMod } = styles[styleIndex]
    const curvePrecision = segment.curvePrecision * curveSubDivisions
    const strokeWidth = curvePrecision <= 1 ? segment.strokeWidth : 0.25

    ctx.globalAlpha = (curvePrecision <= 1 ? 1 : 0.5) * strokeAlpha
    ctx.strokeStyle = strokeColor
    ctx.beginPath()

    for (let i = 0; i < count; i++) {
      const index = indices[i]
      const point = vertices[index]
      ctx.lineWidth = strokeWidth + strokeWidth * strokeWidthMod * strokeWidthModulations[i]
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
  const { styles } = state.controls
  const { curveSubDivisions } = state.controls.modifiers
  const segmentStart = segmentStart_ || 0
  const segmentCount = segmentCount_ || segments.length

  for (let s = segmentStart; s < segmentCount; s++) {
    const segment = segments[s]
    const {
      indices, isClosed, styleIndex,
      strokeWidth, strokeWidthModulations, strokeColor, strokeAlpha
    } = segment

    const count = isClosed ? indices.length - 1 : indices.length
    const curvePrecision = segment.curvePrecision * curveSubDivisions
    if (count < 2 || curvePrecision <= 1) continue

    const { ctx } = contexts[styleIndex]
    const { strokeWidthMod } = styles[styleIndex]
    const points = map(indices, (i) => vertices[i])
    if (isClosed) points.pop()
    const pointsFlat = flatten2(points)

    ctx.globalAlpha = strokeAlpha
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth + strokeWidth * strokeWidthMod * strokeWidthModulations[0]

    ctx.beginPath()
    ctx.moveTo(pointsFlat[0], pointsFlat[1])
    ctx.curve(pointsFlat,
      strokeWidth, strokeWidthMod, strokeWidthModulations,
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
  ctx.arc(point[0], point[1], 6, 0, PI * 2 - PI * 0.1)
  ctx.closePath()
  ctx.stroke()

  ctx.globalAlpha = 0.05
  ctx.strokeStyle = UI_PALETTE.HI_SECONDARY
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(point[0], point[1], 18, 0, PI * 2 - PI * 0.1)
  ctx.closePath()
  ctx.stroke()
}
