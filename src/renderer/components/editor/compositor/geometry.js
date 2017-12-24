import { vec2 } from 'gl-matrix'
import { clamp, mapLinear } from '@/utils/math'

export function createGeometryController (tasks, state) {
  const geometry = {
    computeCurvePrecision: function (vertices, indices) {
      let segmentLength = 0
      for (let i = 0; i < indices.length - 1; i++) {
        segmentLength += vec2.distance(
          vertices[indices[i]], vertices[indices[i + 1]])
      }
      const linkSizeAvg = segmentLength / (indices.length - 1)
      return clamp(0, 1,
        mapLinear(12, 120, 0, 1, linkSizeAvg || 0))
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

    createSegment (point, index) {
      const stateGeom = state.geometry
      const { segments, vertices } = stateGeom
      const {
        strokeWidth, strokeColor, strokeAlpha,
        physicsTypeIndex, styleIndex
      } = state.controls.lineTool

      const isConnected = index != null
      const startPoint = isConnected ? point : vec2.clone(point)
      const startIndex = isConnected ? index : vertices.length

      const connectedIndices = isConnected ? [0] : []
      const modStrokeWidth = geometry.computeModulatedStrokeWidth()
      const nextSegment = {
        indices: [startIndex],
        connectedIndices,
        curvePrecision: 0,
        strokeWidthModulations: [modStrokeWidth],
        strokeWidth,
        strokeColor,
        strokeAlpha,
        physicsTypeIndex,
        styleIndex
      }

      if (!isConnected) vertices.push(startPoint)
      segments.push(nextSegment)
      Object.assign(stateGeom, {
        candidatePoint: null,
        prevPoint: startPoint,
        activeSegment: nextSegment
      })
    },

    updateActiveSegment (point, index) {
      const stateGeom = state.geometry
      const {
        shouldAppend, shouldAppendOnce, linkSizeMin,
        activeSegment, prevPoint, vertices
      } = stateGeom
      if (!activeSegment) return

      const { indices, connectedIndices, strokeWidthModulations } = activeSegment
      const hasCandidate = !!stateGeom.candidatePoint
      const candidatePoint = stateGeom.candidatePoint || vec2.create()

      vec2.copy(candidatePoint, point)
      const dist = vec2.distance(prevPoint, candidatePoint)

      const modStrokeWidth = geometry.computeModulatedStrokeWidth()
      const curvePrecision = geometry.computeCurvePrecision(vertices, indices)

      activeSegment.curvePrecision = curvePrecision

      if (!hasCandidate) {
        stateGeom.candidatePoint = candidatePoint
        indices.push(vertices.length)
        vertices.push(candidatePoint)
        strokeWidthModulations.push(modStrokeWidth)
      } else {
        strokeWidthModulations[strokeWidthModulations.length - 1] = modStrokeWidth
      }

      if ((shouldAppend || shouldAppendOnce) && dist >= linkSizeMin) {
        const isConnected = index != null

        if (isConnected) {
          indices[indices.length - 1] = index
          connectedIndices.push(indices.length - 1)
          vertices.pop()
        }

        stateGeom.prevPoint = candidatePoint
        stateGeom.candidatePoint = null
      }

      stateGeom.shouldAppendOnce = false
    },

    completeActiveSegment (index) {
      const stateGeom = state.geometry
      const { activeSegment, vertices } = stateGeom
      const { indices, connectedIndices, strokeWidthModulations } = activeSegment

      const firstIndex = indices[0]
      const isConnected = index != null && index !== -1
      const isClosed = isConnected && firstIndex === index
      const isConnectedDup = isConnected && indices[indices.length - 1] === index

      if (isConnected && !isConnectedDup) {
        indices[indices.length - 1] = index
        connectedIndices.push(indices.length - 1)
        vertices.pop()
      }
      if (index === -1) {
        indices.pop()
        strokeWidthModulations.pop()
        vertices.pop()
      }

      Object.assign(activeSegment, {
        isClosed,
        isComplete: true,
        indices: new Uint16Array(indices),
        strokeWidthModulations: new Float32Array(strokeWidthModulations)
      })

      geometry.ensureActiveSegmentValid()
      stateGeom.activeSegment = null
    },

    // TODO: Improve name ...
    completeActiveSegmentPopCursor () {
      geometry.completeActiveSegment(-1)
    },

    ensureActiveSegmentValid () {
      const stateGeom = state.geometry
      const { activeSegment } = stateGeom
      const { indices } = activeSegment
      const isInvalid = indices.length === 1 ||
        (indices.length === 2 && indices[0] === indices[1])

      if (isInvalid) {
        stateGeom.activeSegment = null
        geometry.deleteLastSegment()
      }
    },

    deleteLastVertex () {
      const stateGeom = state.geometry
      const { activeSegment, vertices } = stateGeom
      if (!activeSegment) return
      const { indices, connectedIndices } = activeSegment
      if (indices.length <= 1) return
      const lastConnectedIndex = connectedIndices[connectedIndices.length - 1]

      if (lastConnectedIndex === indices.length - 2) {
        connectedIndices.pop()
      } else {
        vertices.splice(-2, 1)
      }

      indices.splice(-2, 1)
      indices[indices.length - 1] = vertices.length - 1

      const prevPointOffset = indices.length > 1 ? 2 : 3
      stateGeom.prevPoint = vertices.length >= 2
        ? vertices[vertices.length - prevPointOffset] : vec2.create()
    },

    deleteLastSegment () {
      const { activeSegment, segments, vertices } = state.geometry
      if (activeSegment) return
      if (segments.length <= 1) return // Preserve base segment
      const lastSegment = segments.pop()
      const vertCount = lastSegment.indices.length - lastSegment.connectedIndices.length
      vertices.splice(-vertCount, vertCount)
    }
  }

  tasks.registerResponders([
    'findClosestPoint',
    'createSegment',
    'updateActiveSegment',
    'completeActiveSegment',
    'completeActiveSegmentPopCursor',
    'deleteLastVertex',
    'deleteLastSegment'
  ], geometry, 'geometry')

  return geometry
}
