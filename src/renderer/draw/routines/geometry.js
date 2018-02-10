import { vec2 } from 'gl-matrix'
import { UI_PALETTE } from '@/constants/color-palettes'
import { map, flatten2 } from '@/utils/array'
import { clamp, mapLinear } from '@/utils/math'
import { arc } from './primitive'

const { max } = Math

export function drawGeometry (state, contexts, segmentStart, segmentCount) {
  drawSegments(state, contexts, segmentStart, segmentCount)
  drawSegmentsCurves(state, contexts, segmentStart, segmentCount)
}

export function drawSegments (state, contexts, segmentStart_, segmentCount_) {
  const { segments, vertices } = state.geometry
  const { styles, modifiers } = state.controls
  const segmentStart = segmentStart_ || 0
  const segmentCount = segmentCount_ || segments.length
  if (!segments.length) return

  for (let s = segmentStart; s < segmentCount; s++) {
    const segment = segments[s]
    const {
      indices, isClosed, styleIndex,
      strokeWidthModulations, strokeColor, strokeAlpha,
      linkSizeAvg
    } = segment

    const count = isClosed ? indices.length - 1 : indices.length
    if (count < 2) continue

    const { ctx } = contexts[styleIndex]
    const { strokeWidthMod } = styles[styleIndex]
    const curvePrecision = computeCurvePrecision(modifiers.curve, linkSizeAvg)
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
  const { styles, modifiers } = state.controls
  const segmentStart = segmentStart_ || 0
  const segmentCount = segmentCount_ || segments.length
  if (!segments.length) return

  for (let s = segmentStart; s < segmentCount; s++) {
    const segment = segments[s]
    const {
      indices, isClosed, styleIndex,
      strokeWidth, strokeWidthModulations, strokeColor, strokeAlpha,
      linkSizeAvg
    } = segment

    const count = isClosed ? indices.length - 1 : indices.length
    const curvePrecision = computeCurvePrecision(modifiers.curve, linkSizeAvg)
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

// TODO: Improve curve precision mapping
function computeCurvePrecision (
  {subDivisions, segMinLength, segMaxLength},
  linkSizeAvg) {
  return Math.round(subDivisions * clamp(0, 1,
    mapLinear(segMinLength, segMaxLength * 10, 0, 1, linkSizeAvg)))
}

// OPTIM: Minimize state stack changes
export function drawFocus (state, ctx, index) {
  const { vertices } = state.geometry
  const { scale } = state.viewport
  const point = vertices[index]
  if (!point) return

  const scaleInv = 1 / scale
  const pointRad = vec2.length(point)
  const innerRad = 6 * scaleInv

  ctx.save()
  ctx.globalAlpha = 0.9
  ctx.lineWidth = 1 * scaleInv
  ctx.strokeStyle = UI_PALETTE.HI_PRIMARY

  ctx.beginPath()
  arc(ctx,
    point[0], point[1], innerRad,
    0, Math.PI * 2,
    false, Math.PI * 0.3)
  ctx.closePath()
  ctx.stroke()

  ctx.rotate(Math.atan2(point[1], point[0]))
  ctx.globalAlpha = 0.25
  ctx.lineWidth = 0.5 * scaleInv
  ctx.strokeStyle = UI_PALETTE.BACK_TERTIARY

  ctx.beginPath()
  ctx.moveTo(pointRad - 120, 0)
  ctx.lineTo(pointRad + 120, 0)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(pointRad, -40)
  ctx.lineTo(pointRad, +40)
  ctx.stroke()

  ctx.restore()
}

// OPTIM: Maybe use GL points to render proximate points
export function drawFocusProximate (state, ctx, indices, ignoreIndex) {
  const { vertices } = state.geometry
  const { scale } = state.viewport
  // TODO: Maybe sort by distance factor
  const count = Math.min(20, indices.length)

  for (let i = 0; i < count; i++) {
    const { index, factor } = indices[i]
    const point = vertices[index]
    if (index === ignoreIndex || !point) continue

    const scaleInv = 1 / scale
    const innerRad = (3 * (1 - factor) + 3) * scaleInv

    ctx.globalAlpha = 0.4 * (1 - factor) + 0.1
    ctx.lineWidth = 0.75 * scaleInv
    ctx.strokeStyle = UI_PALETTE.BACK_TERTIARY

    ctx.beginPath()
    arc(ctx,
      point[0], point[1], innerRad,
      0, Math.PI * 2,
      false, Math.PI * 0.45)
    ctx.closePath()
    ctx.stroke()
  }
}
