import merge from 'lodash.merge'
import { map, flatten2, expand2 } from '@src/utils/array'
import { roundToPlaces } from '@src/utils/number'
import { createControlsState } from '@src/store/modules/Palette'

const ABBRV_KEYS = [
  'activeMode',
  'activePalettes',
  'alphaFactor',
  'alphaFuncIndex',
  'alphaTextureIndex',
  'banding',
  'bandStep',
  'bloom',
  'blurPasses',
  'blurStep',
  'bufferScale',
  'clear',
  'colorHex',
  'colorShift',
  'connectedIndices',
  'constraintGroups',
  'constraintIndex',
  'controls',
  'curve',
  'dashFunction',
  'edges',
  'engineCadence',
  'engineFlex',
  'forces',
  'geometry',
  'index',
  'indices',
  'inputModTypeIndex',
  'intensity',
  'intensityFactor',
  'intensityTypeIndex',
  'isClosed',
  'isComplete',
  'lineLengths',
  'lineTool',
  'linkSizeAvg',
  'modifiers',
  'name',
  'noise',
  'offset',
  'polarAngle',
  'polarIterations',
  'polarOffset',
  'positionTypeIndex',
  'postEffects',
  'radius',
  'scale',
  'segMaxLength',
  'segments',
  'segMinLength',
  'slipTolerance',
  'strokeAlpha',
  'strokeColor',
  'strokeWidth',
  'strokeWidthMod',
  'strokeWidthMod',
  'strokeWidthModulations',
  'styleIndex',
  'styles',
  'subDivisions',
  'textureIndex',
  'thickness',
  'thickness',
  'tintAlpha',
  'tintHex',
  'typeIndex',
  'useScreenTintFunc',
  'vertices',
  'viewport'
]

const ABBRV_KEY_MAP = ABBRV_KEYS
  .reduce((map, key, index) => {
    map[index + ''] = key
    return map
  }, {})

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
      const mapKeysDeep = io.mapKeysDeep.bind(null, KEY_ABBRV_MAP)
      const { geometry, controls, viewport } = state
      const { segments, vertices } = geometry

      const segmentsOut = segments
        .map((seg) => {
          return Object.assign({}, seg, {
            indices: io.serializeArray(seg.indices, 0),
            lineLengths: io.serializeArray(seg.lineLengths, 4),
            strokeWidthModulations: io.serializeArray(seg.strokeWidthModulations, 4)
          })
        })
        .map((seg) => mapKeys(seg))
      const verticesOut = io.serializeArray(flatten2(vertices), 4)

      return mapKeys({
        viewport: mapKeys({
          offset: io.serializeArray(viewport.offset, 4),
          scale: roundToPlaces(viewport.scale, 4)
        }),
        geometry: mapKeys({
          segments: segmentsOut,
          vertices: verticesOut
        }),
        controls: mapKeysDeep(controls)
      })
    },

    deserializeScene (json) {
      const unmapKeys = io.mapKeys.bind(null, ABBRV_KEY_MAP)
      const unmapKeysDeep = io.mapKeysDeep.bind(null, ABBRV_KEY_MAP)

      const data = unmapKeys(json)
      const { segments, vertices } = unmapKeys(data.geometry)
      const viewport = unmapKeys(data.viewport)
      const controls = unmapKeysDeep(data.controls)
      const defaultControls = createControlsState()

      const segmentsOut = segments
        .map((seg) => unmapKeys(seg))
        .map((seg) => {
          return Object.assign({}, seg, {
            indices: new Uint16Array(
              io.deserializeIntArray(seg.indices)),
            lineLengths: new Float32Array(
              io.deserializeFloatArray(seg.lineLengths)),
            strokeWidthModulations: new Float32Array(
              io.deserializeFloatArray(seg.strokeWidthModulations))
          })
        })
      const verticesOut = expand2(
        io.deserializeFloatArray(vertices), Float32Array)

      return {
        viewport: {
          offset: io.deserializeFloatArray(viewport.offset),
          scale: viewport.scale
        },
        geometry: {
          segments: segmentsOut,
          vertices: verticesOut
        },
        controls: merge(defaultControls, controls)
      }
    },

    mapKeys (map, src) {
      if (typeof src !== 'object') return src

      return Object.keys(src).reduce((out, key) => {
        out[map[key] || key] = src[key]
        return out
      }, {})
    },

    mapKeysDeep (map, src) {
      if (typeof src !== 'object') return src

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
