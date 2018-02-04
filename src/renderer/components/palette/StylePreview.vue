<template>
  <svg class="palette-style-preview"
    :width="width" :height="height">
    <g
      :stroke="strokeColor"
      :stroke-opacity="strokeOpacity"
      :stroke-dasharray="strokeDashArray"
      fill="none">
      <polyline
        :points="pathPointsA"
        :stroke-width="modStrokeWidth(-0.2)" />
      <polyline
        :points="pathPointsB"
        :stroke-width="modStrokeWidth(0)" />
      <polyline
        :points="pathPointsC"
        :stroke-width="modStrokeWidth(0.4)" />
    </g>
    <g :transform="`translate(0, ${height / 2})`">
      <polygon
        fill="#41EDC1"
        stroke-width="1"
        :points="pathPointsOrigin" />
    </g>
  </svg>
</template>

<style lang="scss">
.palette-style-preview {
  display: block;
  margin: 0 8px;
}
</style>

<script>
import {
  clamp,
  mapLinear
} from '@/utils/math'
import {
  pointsCircle
} from '@/utils/svg'

export default {
  name: 'palette-style-preview',

  props: {
    model: Object,
    width: Number,
    height: Number,
    segments: Number
  },

  methods: {
    genEndPoints: pointsCircle.bind(null, 4),

    genPathSamples () {
      const count = this.segments - 1
      const samples = (new Array(count))
        .fill(0)
        .map((n, i) => (Math.random() * 2 - 1))
      samples.unshift(0)
      return samples
    },

    genPathPoints (width, height, padWidth, padHeight) {
      const pathSamples = this.genPathSamples()
      const count = pathSamples.length
      return pathSamples
        .map((n, i) => ([
          mapLinear(0, count - 1, padWidth, width - padWidth, i),
          mapLinear(-1, 1, padHeight, height - padHeight, n)
        ]))
        .map((v) => v.join(','))
        .join(' ')
    },

    modStrokeWidth (factor) {
      const { strokeWidth } = this
      const { strokeWidthMod } = this.model
      return clamp(0, 8,
        strokeWidth + strokeWidth * strokeWidthMod * factor)
    }
  },

  computed: {
    pathPointsOrigin () {
      return this.genEndPoints(4, 0, 3)
    },

    pathPointsA () {
      return this.genPathPoints(this.width, this.height, 4, 2)
    },

    pathPointsB () {
      return this.genPathPoints(this.width * 0.8, this.height, 4, 2)
    },

    pathPointsC () {
      return this.genPathPoints(this.width * 0.6, this.height, 4, 2)
    },

    strokeWidth () {
      const { thickness } = this.model
      return mapLinear(0, 5, 0, 7, thickness)
    },

    strokeColor () {
      const { tintHex } = this.model
      return tintHex
    },

    strokeOpacity () {
      const { tintAlpha } = this.model
      return tintAlpha
    },

    strokeDashArray () {
      const { alphaFuncIndex } = this.model
      switch (alphaFuncIndex) {
        case 0:
          return ''
        case 1:
          return '2, 4'
        case 2:
          return '4, 2'
        case 3:
          return '2, 4, 2, 8'
      }
    }
  }
}
</script>
