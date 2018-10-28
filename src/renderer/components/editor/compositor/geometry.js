import { vec2 } from 'gl-matrix'
import { clamp, mapLinear } from '@renderer/utils/math'

export function createGeometryController (tasks, state) {
  const geometry = {
    computeStrokeWidth (baseWidth) {
      return baseWidth * baseWidth
    },

    computeLinkSizeAvg: function (vertices, indices) {
      let segmentLength = 0
      for (let i = 0; i < indices.length - 1; i++) {
        segmentLength += vec2.distance(
          vertices[indices[i]], vertices[indices[i + 1]])
      }
      return (segmentLength / (indices.length - 1)) || 0
    },

    // NOTE: Map storke modulation to range [-1, 1] from active input type
    computeModulatedStrokeWidth () {
      const { inputModTypeIndex } = state.controls.lineTool
      switch (inputModTypeIndex) {
        // Velocity
        case 1:
          return clamp(-0.9, 1,
            mapLinear(0, 1.5, 1, -1, state.seek.velocitySmoothed))
        // Pen Pressure
        case 2:
          return state.drag.pressure * 2 - 1
        // Mousewheel / scroll
        case 3:
          return state.seek.wheelOffset
      }
      return 0
    },

    computeLineLengths (vertices, indices) {
      const count = indices.length - 1
      const lengths = new Float32Array(count)
      for (let i = 0; i < count; i++) {
        lengths[i] = vec2.distance(
          vertices[indices[i]],
          vertices[indices[i + 1]])
      }
      return lengths
    },

    // OPTIM: Maybe optimize with spacial index (kd-tree)
    // TODO: Cleanup proximate index finding
    findClosestPoint (
      target, maxDist = 10, lastOffset = 0, ignoreIndex = -1,
      proximateIndices = null, proximateDistance = 0
    ) {
      const { vertices } = state.geometry
      const maxDistSq = maxDist * maxDist
      const count = vertices.length - lastOffset
      const proximateDistanceSq = proximateDistance * proximateDistance

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
        if (proximateIndices && distSq < proximateDistanceSq) {
          proximateIndices.push({
            index: i,
            factor: distSq / proximateDistanceSq
          })
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

    createSegment (point, index) {
      const stateGeom = state.geometry
      const { segments, vertices } = stateGeom
      const {
        strokeWidth, strokeColor, strokeAlpha,
        constraintIndex, styleIndex
      } = state.controls.lineTool

      const isConnected = index != null
      const startPoint = isConnected ? point : vec2.clone(point)
      const startIndex = isConnected ? index : vertices.length

      const connectedIndices = isConnected ? [0] : []
      const modStrokeWidth = geometry.computeModulatedStrokeWidth()
      const nextSegment = {
        indices: [startIndex],
        connectedIndices,
        linkSizeAvg: 0,
        strokeWidthModulations: [modStrokeWidth],
        strokeWidth: geometry.computeStrokeWidth(strokeWidth),
        strokeColor,
        strokeAlpha,
        constraintIndex,
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
      const { activeSegment } = stateGeom
      if (!activeSegment) return

      const {
        shouldAppend, shouldAppendOnce,
        linkSizeMin, linkSizeMinStrokeFactor,
        prevPoint, vertices
      } = stateGeom
      const {
        indices, connectedIndices,
        strokeWidth, strokeWidthModulations
      } = activeSegment

      const hasCandidate = !!stateGeom.candidatePoint
      const dist = vec2.distance(prevPoint, point)
      const adjLinkSizeMin = linkSizeMin + strokeWidth * linkSizeMinStrokeFactor
      if (!hasCandidate && dist < adjLinkSizeMin * 0.2) return

      const candidatePoint = stateGeom.candidatePoint || vec2.create()
      vec2.copy(candidatePoint, point)

      const modStrokeWidth = geometry.computeModulatedStrokeWidth()
      const linkSizeAvg = geometry.computeLinkSizeAvg(vertices, indices)
      activeSegment.linkSizeAvg = linkSizeAvg

      if (!hasCandidate) {
        stateGeom.candidatePoint = candidatePoint
        indices.push(vertices.length)
        vertices.push(candidatePoint)
        strokeWidthModulations.push(modStrokeWidth)
      } else {
        strokeWidthModulations[strokeWidthModulations.length - 1] = modStrokeWidth
      }

      if ((shouldAppend || shouldAppendOnce) && dist >= adjLinkSizeMin) {
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

    updateActiveSegmentStrokeWidthMod (value) {
      const { activeSegment, candidatePoint } = state.geometry
      if (!(activeSegment && candidatePoint)) return

      const { strokeWidthModulations } = activeSegment
      strokeWidthModulations[strokeWidthModulations.length - 1] = value
    },

    completeActiveSegment (index) {
      const stateGeom = state.geometry
      const { activeSegment, vertices } = stateGeom
      if (!activeSegment) return

      const { indices, connectedIndices, strokeWidthModulations } = activeSegment
      const firstIndex = indices[0]
      const isConnected = index != null && index !== -1
      const isConnectedDup = isConnected && indices[indices.length - 1] === index
      let isClosed = isConnected && firstIndex === index

      if (isConnected && !isConnectedDup) {
        indices[indices.length - 1] = index
        connectedIndices.push(indices.length - 1)
        vertices.pop()
      }
      if (index === -1) {
        indices.pop()
        strokeWidthModulations.pop()
        vertices.pop()
        isClosed = firstIndex === indices[indices.length - 1]
      }

      const nextIndices = new Uint16Array(indices)
      const nextConnectedIndices = new Uint16Array(connectedIndices)
      const nextStrokeWidthModulations = new Float32Array(strokeWidthModulations)
      const lineLengths = this.computeLineLengths(vertices, indices)

      Object.assign(activeSegment, {
        isClosed,
        isComplete: true,
        indices: nextIndices,
        connectedIndices: nextConnectedIndices,
        lineLengths,
        strokeWidthModulations: nextStrokeWidthModulations
      })

      geometry.ensureActiveSegmentValid()
      stateGeom.activeSegment = null
    },

    completeActiveSegmentDiscardCursor () {
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

    // Delete last vertex in active segment
    deleteLastVertex () {
      const stateGeom = state.geometry
      const { activeSegment, vertices } = stateGeom
      if (!activeSegment) return

      const {
        indices, connectedIndices,
        strokeWidthModulations
      } = activeSegment
      if (indices.length <= 1) return

      const lastConnectedIndex = connectedIndices[connectedIndices.length - 1]
      if (lastConnectedIndex === indices.length - 2) {
        connectedIndices.pop()
      } else {
        vertices.splice(-2, 1)
      }

      indices.splice(-2, 1)
      indices[indices.length - 1] = vertices.length - 1
      strokeWidthModulations.pop()

      const prevPointOffset = indices.length > 1 ? 2 : 3
      stateGeom.prevPoint = vertices.length >= 2
        ? vertices[vertices.length - prevPointOffset]
        : vec2.create()
    },

    // Delete last completed segment
    deleteLastSegment () {
      const { activeSegment, segments, vertices } = state.geometry
      if (activeSegment) return
      if (segments.length <= 0) return
      const lastSegment = segments.pop()
      const vertCount = lastSegment.indices.length - lastSegment.connectedIndices.length
      vertices.splice(-vertCount, vertCount)
    },

    // Merge segment props from one state to another
    mergeSegmentProp (propName, vFrom, vTo) {
      const { segments } = state.geometry
      segments.forEach((segment) => {
        if (segment[propName] === vFrom) {
          segment[propName] = vTo
        }
      })
    }
  }

  tasks.registerResponders([
    'findClosestPoint',
    'createSegment',
    'updateActiveSegment',
    'completeActiveSegment',
    'completeActiveSegmentDiscardCursor',
    'deleteLastVertex',
    'deleteLastSegment',
    'mergeSegmentProp'
  ], geometry, 'geometry')

  return geometry
}
