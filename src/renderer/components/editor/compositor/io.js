import { flatten2, expand2 } from '@/utils/array'
import { roundToPlaces } from '@/utils/number'

export function createIOController (tasks, state) {
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
            indices: io.deserializeIntArray(seg.indices),
            strokeWidthModulations: io.deserializeFloatArray(seg.strokeWidthModulations)
          })
        })
      const vertices = expand2(io.deserializeFloatArray(geometry.vertices))
      return {
        geometry: {
          segments,
          vertices
        },
        controls: Object.assign({}, controls)
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
