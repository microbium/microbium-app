import { vec2 } from 'gl-matrix'

import { UI_PALETTE } from '@/constants/color-palettes'
import { clamp, mapLinear } from '@/utils/math'

export function createGeometryController (tasks, state) {
  const geometry = {
    // TODO: Improve curve precision mapping
    computeCurvePrecision: function (vertices, indices) {
      let segmentLength = 0
      for (let i = 0; i < indices.length - 1; i++) {
        segmentLength += vec2.distance(
          vertices[indices[i]], vertices[indices[i + 1]])
      }

      const linkSizeAvg = segmentLength / (indices.length - 1)
      return Math.round(clamp(0, 1,
        mapLinear(12, 120, 0, 1, linkSizeAvg)))
    },

    // NOTE: Map storke modulation to range [-1, 1] from active input type
    computeModulatedStrokeWidth () {
      const { inputModTypeIndex } = state.controls.lineTool
      switch (inputModTypeIndex) {
        // Velocity
        case 1:
          return clamp(-0.9, 1,
            mapLinear(0, 2, 1, -1, state.seek.velocity))
        // Pen Pressure
        case 2:
          return state.drag.pressure * 2 - 1
      }
      return 0
    },

    // OPTIM: Maybe optimize with spacial index (kd-tree)
    findClosestPoint (target, maxDist = 10, lastOffset = 0, ignoreIndex = -1) {
      const { vertices } = state.geometry
      const maxDistSq = maxDist * maxDist
      const count = vertices.length - lastOffset
      let closestPointIndex = null
      let closestDistSq = Infinity
      for (let i = 0; i < count; i++) {
        if (i === ignoreIndex) continue
        const point = vertices[i]
        const distSq = vec2.squaredDistance(target, point)
        if (distSq < maxDistSq && distSq < closestDistSq) {
          closestPointIndex = i
          closestDistSq = distSq
        }
      }
      if (closestPointIndex != null) {
        return {
          index: closestPointIndex,
          point: vertices[closestPointIndex]
        }
      }
      return null
    },

    createBaseFromState (initialState) {
      const { segments, vertices } = initialState
      Object.assign(state.geometry, {
        segments,
        vertices
      })
    },

    createBaseSegment () {
      const radius = 22
      const count = 5

      const { lineTool } = state.controls
      const prevLineTool = Object.assign({}, lineTool)

      state.geometry.shouldAppend = true
      Object.assign(state.controls.lineTool, {
        strokeWidth: 1,
        strokeColor: UI_PALETTE.BACK_PRIMARY,
        strokeAlpha: 0.95,
        strokeWidthMod: 0,
        inputModTypeIndex: 0,
        styleIndex: 0
      })

      geometry.createSegment([radius, 0])
      for (let i = 1; i < (1 + count); i++) {
        const angle = i / count * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        geometry.updateActiveSegment([x, y])
      }
      geometry.completeActiveSegment(0)

      state.geometry.shouldAppend = false
      Object.assign(state.controls.lineTool, prevLineTool)
    },

    createSegment (point, index) {
      const stateGeom = state.geometry
      const { segments, vertices } = stateGeom
      const {
        strokeWidth, strokeColor, strokeAlpha,
        styleIndex
      } = state.controls.lineTool
      const isExisting = index != null

      const startPoint = isExisting ? point : vec2.clone(point)
      const startIndex = isExisting ? index : vertices.length

      const modStrokeWidth = geometry.computeModulatedStrokeWidth()
      const nextSegment = {
        indices: [startIndex],
        uniqueIndicesCount: isExisting ? 0 : 1,
        curvePrecision: 0,
        strokeWidthModulations: [modStrokeWidth],
        strokeWidth,
        strokeColor,
        strokeAlpha,
        styleIndex
      }

      if (!isExisting) vertices.push(startPoint)
      segments.push(nextSegment)
      Object.assign(stateGeom, {
        candidatePoint: null,
        prevPoint: startPoint,
        activeSegment: nextSegment,
        activeSegmentIsConnected: index != null
      })
    },

    updateActiveSegment (point, index) {
      const stateGeom = state.geometry
      const {
        shouldAppend, shouldAppendOnce, linkSizeMin,
        activeSegment, prevPoint, vertices
      } = stateGeom
      if (!activeSegment) return

      const { indices, strokeWidthModulations } = activeSegment
      const hasCandidate = !!stateGeom.candidatePoint
      const candidatePoint = stateGeom.candidatePoint || vec2.create()

      vec2.copy(candidatePoint, point)
      const dist = vec2.distance(prevPoint, candidatePoint)

      const modStrokeWidth = geometry.computeModulatedStrokeWidth()
      const curvePrecision = geometry.computeCurvePrecision(vertices, indices)

      activeSegment.curvePrecision = curvePrecision

      if (!hasCandidate) {
        stateGeom.candidatePoint = candidatePoint
        activeSegment.uniqueIndicesCount++
        indices.push(vertices.length)
        vertices.push(candidatePoint)
        strokeWidthModulations.push(modStrokeWidth)
      } else {
        strokeWidthModulations[strokeWidthModulations.length - 1] = modStrokeWidth
      }

      if ((shouldAppend || shouldAppendOnce) && dist >= linkSizeMin) {
        const isConnected = index != null
        const isConnectedSelf = isConnected && indices.indexOf(index) !== -1

        if (isConnectedSelf) {
          activeSegment.uniqueIndicesCount--
          indices[indices.length - 1] = index
          vertices.pop()
        }

        stateGeom.prevPoint = candidatePoint
        stateGeom.candidatePoint = null
        stateGeom.activeSegmentIsConnected = isConnected
      }

      stateGeom.shouldAppendOnce = false
    },

    completeActiveSegment (index) {
      const stateGeom = state.geometry
      const { activeSegment, vertices } = stateGeom
      const { indices, strokeWidthModulations } = activeSegment

      const firstIndex = indices[0]
      const isConnected = index != null
      const isClosed = isConnected && firstIndex === index

      if (isConnected) {
        indices[indices.length - 1] = index
        activeSegment.uniqueIndicesCount--
        vertices.pop()
      }

      stateGeom.activeSegmentIsConnected = isConnected
      Object.assign(activeSegment, {
        isClosed,
        isComplete: true,
        indices: new Uint16Array(indices),
        strokeWidthModulations: new Float32Array(strokeWidthModulations)
      })
    },

    ensureActiveSegmentValid () {
      const stateGeom = state.geometry
      const {
        activeSegment, activeSegmentIsConnected,
        segments, vertices
      } = stateGeom
      const { indices } = activeSegment
      const isInvalid = indices.length === 1 ||
        (indices.length === 2 && indices[0] === indices[1])

      if (isInvalid) {
        stateGeom.activeSegment = null
        segments.pop()
        if (!activeSegmentIsConnected) vertices.pop()
      }
    },

    deleteLastSegment () {
      const { segments, vertices } = state.geometry
      if (segments.length <= 1) return // Preserve base segment
      const lastSegment = segments.pop()
      const vertCount = lastSegment.uniqueIndicesCount
      vertices.splice(-vertCount, vertCount)
    },

    // TODO: Create variation on DistanceConstraint that accepts indices in this segment format
    expandIndicesToLines (indices) {
      return indices.slice(0, -1).reduce((all, v, i) => {
        const a = indices[i]
        const b = indices[i + 1]
        all.push([a, b])
        return all
      }, [])
    }
  }

  const registeredMethods = [
    'expandIndicesToLines',
    'findClosestPoint',
    'createSegment',
    'updateActiveSegment',
    'completeActiveSegment',
    'ensureActiveSegmentValid',
    'deleteLastSegment'
  ]

  registeredMethods.forEach((name) => {
    tasks.registerResponder(`geometry.${name}`, geometry, geometry[name])
  })

  return geometry
}
