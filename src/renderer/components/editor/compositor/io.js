import { map, flatten2, expand2 } from '@/utils/array'
import { roundToPlaces } from '@/utils/number'

const ABBRV_KEY = {
  'sw': 'strokeWidth',
  'sc': 'strokeColor',
  'sa': 'strokeAlpha',
  'sm': 'strokeWidthMod',
  'mt': 'inputModTypeIndex',
  'pt': 'physicsTypeIndex',
  'si': 'styleIndex',

  'ii': 'indices',
  'ci': 'connectedIndices',
  'cp': 'curvePrecision',
  'wm': 'strokeWidthModulations',
  'cl': 'isClosed',
  'co': 'isComplete',

  'ge': 'geometry',
  'cn': 'controls',
  'sg': 'segments',
  'vt': 'vertices'
}
const KEY_ABBRV = Object.keys(ABBRV_KEY)
  .reduce((map, key) => {
    map[ABBRV_KEY[key]] = key
    return map
  }, {})

// OPTIM: Maybe use proto-buffers for state serialization
// https://github.com/mafintosh/protocol-buffers
export function createIOController (tasks, state) {
  const { requestSync } = tasks

  const io = {
    serializeScene () {
      const mapKeys = io.mapKeys.bind(null, KEY_ABBRV)
      const { geometry, controls } = state
      const { segments, vertices } = geometry

      const segmentsOut = segments
        .map((seg) => {
          return Object.assign({}, seg, {
            indices: io.serializeArray(seg.indices, 0),
            strokeWidthModulations: io.serializeArray(seg.strokeWidthModulations, 4)
          })
        })
        .map((seg) => mapKeys(seg))
      const verticesOut = io.serializeArray(flatten2(vertices), 4)

      return mapKeys({
        geometry: mapKeys({
          segments: segmentsOut,
          vertices: verticesOut
        }),
        controls: Object.assign({}, controls)
      })
    },

    deserializeScene (json) {
      const mapKeys = io.mapKeys.bind(null, ABBRV_KEY)
      const { geometry, controls } = mapKeys(json)
      const { segments, vertices } = mapKeys(geometry)

      const segmentsOut = segments
        .map((seg) => mapKeys(seg))
        .map((seg) => {
          return Object.assign({}, seg, {
            indices: new Uint16Array(
              io.deserializeIntArray(seg.indices)),
            strokeWidthModulations: new Float32Array(
              io.deserializeFloatArray(seg.strokeWidthModulations))
          })
        })
      const verticesOut = expand2(
        io.deserializeFloatArray(vertices), Float32Array)

      return {
        geometry: {
          segments: segmentsOut,
          vertices: verticesOut
        },
        controls: Object.assign({}, controls)
      }
    },

    mapKeys (map, src) {
      return Object.keys(src).reduce((out, key) => {
        out[map[key] || key] = src[key]
        return out
      }, {})
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
      return map(arr, (n) => roundToPlaces(n, precision))
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
