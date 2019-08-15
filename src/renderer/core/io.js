import { map, flatten2, expand2 } from '@renderer/utils/array'
import { roundToPlaces } from '@renderer/utils/number'
import { SERIALIZE_KEYS_MAP } from '@renderer/constants/scene-format'

const DEBUG_LOG_CONTROLLER_PROPS = false

const ABBRV_KEY_MAP = SERIALIZE_KEYS_MAP
const KEY_ABBRV_MAP = Object.keys(ABBRV_KEY_MAP)
  .reduce((map, key) => {
    map[ABBRV_KEY_MAP[key]] = key
    return map
  }, {})

// OPTIM: Maybe use proto-buffers for state serialization
// https://github.com/mafintosh/protocol-buffers
export function createIOController (tasks, state) {
  const { requestSync } = tasks

  const io = {
    serializeScene () {
      const mapKeys = io.mapKeys.bind(null, KEY_ABBRV_MAP)
      const { geometry, controls, viewport } = state
      const { segments, vertices } = geometry

      const segmentsOut = segments
        .map((seg) => ({
          connectedIndices: io.serializeArray(seg.connectedIndices, 0),
          constraintIndex: seg.constraintIndex,
          depths: io.serializeArray(seg.depths, 3),
          indices: io.serializeArray(seg.indices, 0),
          isClosed: io.serializeBool(seg.isClosed),
          lineLengths: io.serializeArray(seg.lineLengths, 2),
          linkSizeAvg: roundToPlaces(seg.linkSizeAvg, 3),
          strokeAlpha: roundToPlaces(seg.strokeAlpha, 3),
          strokeColor: seg.strokeColor,
          strokeWidth: roundToPlaces(seg.strokeWidth, 3),
          strokeWidthModulations: io.serializeArray(seg.strokeWidthModulations, 3),
          fillAlpha: roundToPlaces(seg.fillAlpha, 3),
          fillColor: seg.fillColor,
          styleIndex: seg.styleIndex
        }))
        .map((seg) => mapKeys(seg))
      const verticesOut = io.serializeArray(flatten2(vertices), 2)

      return {
        viewport: mapKeys({
          offset: io.serializeArray(viewport.offset, 2),
          scale: roundToPlaces(viewport.scale, 3)
        }),
        geometry: mapKeys({
          segments: segmentsOut,
          vertices: verticesOut
        }),
        controls
      }
    },

    deserializeScene (json) {
      const unmapKeys = io.mapKeys.bind(null, ABBRV_KEY_MAP)
      const unmapKeysDeep = io.mapKeysDeep.bind(null, ABBRV_KEY_MAP)

      const data = unmapKeys(json)
      const { segments, vertices } = unmapKeys(data.geometry)
      const viewport = unmapKeys(data.viewport)
      const controls = unmapKeysDeep(data.controls)

      const segmentsOut = segments
        .map((seg) => unmapKeys(seg))
        .map((seg) => ({
          connectedIndices: new Uint16Array(
            io.deserializeIntArray(seg.connectedIndices)),
          constraintIndex: seg.constraintIndex,
          depths: new Float32Array(
            io.deserializeFloatArray(seg.depths)),
          indices: new Uint16Array(
            io.deserializeIntArray(seg.indices)),
          isClosed: io.deserializeBool(seg.isClosed),
          isComplete: true,
          lineLengths: new Float32Array(
            io.deserializeFloatArray(seg.lineLengths)),
          linkSizeAvg: seg.linkSizeAvg,
          strokeAlpha: seg.strokeAlpha,
          strokeColor: seg.strokeColor,
          strokeWidth: seg.strokeWidth,
          strokeWidthModulations: new Float32Array(
            io.deserializeFloatArray(seg.strokeWidthModulations)),
          fillAlpha: seg.fillAlpha,
          fillColor: seg.fillColor,
          styleIndex: seg.styleIndex
        }))
      const verticesOut = expand2(
        io.deserializeFloatArray(vertices), Float32Array)

      if (DEBUG_LOG_CONTROLLER_PROPS) {
        io.logControllerProps('controls', controls)
      }

      return {
        viewport: {
          offset: io.deserializeFloatArray(viewport.offset),
          scale: viewport.scale
        },
        geometry: {
          segments: segmentsOut,
          vertices: verticesOut
        },
        controls
      }
    },

    logControllerProps (basePath, controls) {
      if (controls == null || typeof controls !== 'object') return
      Object.keys(controls).forEach((key) => {
        const propPath = `${basePath}.${key}`
        const prop = controls[key]
        if (typeof prop === 'object') {
          io.logControllerProps(propPath, prop)
        } else if (key.indexOf('Controller') !== -1 && prop !== -1) {
          console.log(propPath, prop)
        }
      })
    },

    mapKeys (map, src) {
      if (typeof src !== 'object') return src

      return Object.keys(src).reduce((out, key) => {
        out[map[key] || key] = src[key]
        return out
      }, {})
    },

    mapKeysDeep (map, src) {
      if (typeof src !== 'object' || src == null) return src

      return Object.keys(src).reduce((out, key) => {
        const mappedKey = map[key] || key
        const val = src[key]

        if (typeof val === 'object') {
          if (Array.isArray(val)) {
            out[mappedKey] = val.map((innerVal) => io.mapKeysDeep(map, innerVal))
          } else {
            out[mappedKey] = io.mapKeysDeep(map, val)
          }
        } else {
          out[mappedKey] = val
        }

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

    serializeBool (val) {
      return val ? 1 : 0
    },

    deserializeBool (val) {
      return !!val
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
