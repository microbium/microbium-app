import { vec2 } from 'gl-matrix'
import { UI_PALETTE } from '@/constants/color-palettes'
import { map, flatten2 } from '@/utils/array'

const { PI, max } = Math

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
  if (!segments.length) return

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
    const curvePrecision = Math.round(segment.curvePrecision * curveSubDivisions)
    const strokeWidth = curvePrecision <= 1 ? segment.strokeWidth : 0.25

    ctx.globalAlpha = (curvePrecision <= 1 ? 1 : 0.5) * strokeAlpha
    ctx.strokeStyle = strokeColor
    ctx.beginPath()

    for (let i = 0; i < count; i++) {
      const index = indices[i]
      const point = vertices[index]
      ctx.lineWidth = max(0,
        strokeWidth + strokeWidth * strokeWidthMod * strokeWidthModulations[i])
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
  if (!segments.length) return

  for (let s = segmentStart; s < segmentCount; s++) {
    const segment = segments[s]
    const {
      indices, isClosed, styleIndex,
      strokeWidth, strokeWidthModulations, strokeColor, strokeAlpha
    } = segment

    const count = isClosed ? indices.length - 1 : indices.length
    const curvePrecision = Math.round(segment.curvePrecision * curveSubDivisions)
    if (count < 2 || curvePrecision <= 1) continue

    // OPTIM: Reduce data transformations needed to draw curves
    const { ctx } = contexts[styleIndex]
    const { strokeWidthMod } = styles[styleIndex]
    const points = map(indices, (i) => vertices[i])
    if (isClosed) points.pop()
    const pointsFlat = flatten2(points)

    ctx.globalAlpha = strokeAlpha
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = max(0,
      strokeWidth + strokeWidth * strokeWidthMod * strokeWidthModulations[0])

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

// OPTIM: Minimize state stack changes
export function drawFocus (state, ctx, index) {
  const { vertices } = state.geometry
  const { size } = state.viewport
  const point = vertices[index]
  if (!point) return

  const count = 4
  const angleStep = PI * 2 / count
  const pointRad = vec2.length(point)
  const innerRad = 6
  const outerRad = pointRad * 0.3
  const outerSize = Math.max(size[0], size[1])

  ctx.save()
  ctx.translate(point[0], point[1])
  ctx.globalAlpha = 0.9
  ctx.lineWidth = 1
  ctx.strokeStyle = UI_PALETTE.HI_PRIMARY

  ctx.beginPath()
  for (let i = 0; i < count; i++) {
    if (i === 0) ctx.moveTo(innerRad, 0)
    else ctx.lineTo(innerRad, 0)
    ctx.rotate(angleStep)
  }
  ctx.closePath()
  ctx.stroke()

  ctx.translate(-point[0], -point[1])
  ctx.rotate(Math.atan2(point[1], point[0]))
  ctx.globalAlpha = 0.8
  ctx.lineWidth = 0.5
  ctx.strokeStyle = UI_PALETTE.HI_SECONDARY

  ctx.beginPath()
  ctx.moveTo(outerRad, 0)
  ctx.lineTo(outerRad + outerSize, 0)
  ctx.stroke()

  // FIXME: Radius not aligned ..
  ctx.beginPath()
  ctx.arc(0, 0, pointRad + 6, -0.2, 0.2)
  ctx.stroke()

  ctx.restore()
}
