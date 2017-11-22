import { flatten2, expand2 } from '@/utils/array'
import { roundToPlaces } from '@/utils/number'

// OPTIM: Maybe use proto-buffers for state serialization
// https://github.com/mafintosh/protocol-buffers
export function createIOController (tasks, state) {
  const { requestSync } = tasks

  const io = {
    serializeScene () {
      const { geometry, controls } = state
      const segments = geometry.segments
        .map((seg) => {
          return Object.assign({}, seg, {
            indices: io.serializeArray(seg.indices, 0),
            strokeWidthModulations: io.serializeArray(seg.strokeWidthModulations, 4)
          })
        })
      const vertices = io.serializeArray(flatten2(geometry.vertices), 4)
      return {
        geometry: {
          segments,
          vertices
        },
        controls: Object.assign({}, controls)
      }
    },

    deserializeScene (json) {
      const { geometry, controls } = json
      const segments = geometry.segments
        .map((seg) => {
          return Object.assign({}, seg, {
            indices: new Uint16Array(
              io.deserializeIntArray(seg.indices)),
            strokeWidthModulations: new Float32Array(
              io.deserializeFloatArray(seg.strokeWidthModulations))
          })
        })
      const vertices = expand2(
        io.deserializeFloatArray(geometry.vertices), Float32Array)
      return {
        geometry: {
          segments,
          vertices
        },
        controls: Object.assign({}, controls)
      }
    },

    serializeMinimalGeometry () {
      const { geometry } = state
      const segments = geometry.segments.map((seg) => {
        return io.serializeArray(seg.indices, 0)
      })
      const vertices = io.serializeArray(flatten2(geometry.vertices), 2)
      return {
        segments,
        vertices
      }
    },

    serializeFrame () {
      const { seek, simulation } = state
      const cursorVelocity = seek.velocity
      const simIsRunning = simulation.isRunning
      const particleVelocities = requestSync('simulation.computeParticleVelocities')

      let velocities = null
      if (particleVelocities) {
        velocities = io.serializeArray(particleVelocities, 2)
      }

      return {
        cursorVelocity,
        simIsRunning,
        velocities
      }
    },

    serializeArray (arr, precision) {
      return arr.map((n) => roundToPlaces(n, precision))
        .join(',')
    },

    deserializeFloatArray (str) {
      return str.split(',')
        .map((s) => parseFloat(s))
    },

    deserializeIntArray (str) {
      return str.split(',')
        .map((s) => parseInt(s, 10))
    }
  }

  return io
}
