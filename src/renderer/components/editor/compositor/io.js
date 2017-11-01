import { vec2 } from 'gl-matrix'

import { LINE_WIDTH_KEYS } from '@/constants/line-styles'

// FEAT: Add file load / save / incremental save
export function createIOController (tasks, state, renderer) {
  const io = {
    // TODO: Add lineStyleIndex, lineColor, lineAlpha
    serializeGeometry () {
      const stateGeom = state.geometry
      const { segments, vertices } = stateGeom
      const { map } = Array.prototype

      const lineWidthLookup = toHash(LINE_WIDTH_KEYS)

      function toHash (arr) {
        return arr.reduce((hash, v, i) => {
          hash[v] = i
          return hash
        }, {})
      }

      function toFixed (n, len) {
        const factor = Math.pow(10, len)
        return Math.round(n * factor) / factor
      }

      const segmentsStr = segments
        .map((segment) => {
          const { lineWidth } = segment
          return [
            lineWidthLookup[lineWidth],
            segment.indices.join(',')
          ].join('_')
        })
        .join('&')

      const verticesStr = vertices
        .map((vert) => {
          return map.call(vert, (v) => toFixed(v, 2)).join(',')
        })
        .join('&')

      return [
        segmentsStr,
        verticesStr
      ].join('__')
    },

    serializeGeometryToLocalStorage () {
      const hash = io.serializeGeometry()
      window.localStorage.setItem('editor-data', hash)
    },

    deserializeGeometry (str) {
      const [segmentsStr, verticesStr] = str.split('__')

      const vertices = verticesStr.split('&').map((str) => {
        const vals = str.split(',')
          .map((str) => parseFloat(str))
        return vec2.clone(vals)
      })

      const segments = segmentsStr.split('&').map((str) => {
        const [lineWidthStr, indicesStr] = str.split('_')

        const lineWidth = LINE_WIDTH_KEYS[parseInt(lineWidthStr, 10)]
        const indices = indicesStr.split(',')
          .map((str) => parseInt(str, 10))
        const curvePrecision = tasks.requestSync('geometry.computeCurvePrecision',
          vertices, indices)
        const isClosed = indices[0] === indices[indices.length - 1]

        return {
          indices: new Uint16Array(indices),
          lineWidth,
          curvePrecision,
          isClosed
        }
      })

      return {
        segments,
        vertices
      }
    },

    deserializeGeometryFromLocalStorage () {
      const hash = window.localStorage.getItem('editor-data')
      if (!hash) return null
      return io.deserializeGeometry(hash)
    }
  }

  return { io }
}
