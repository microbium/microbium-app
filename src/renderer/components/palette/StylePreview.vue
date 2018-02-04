<template>
  <svg class="palette-style-preview"
    :width="width" :height="height">
    <g
      :transform="`translate(${width / 2}, ${height / 2})`"
      :stroke="strokeColor"
      :stroke-opacity="strokeOpacity"
      :stroke-dasharray="strokeDashArray"
      fill="none">
      <g transform="rotate(-10)">
        <polyline
          :points="pathPointsA"
          :stroke-width="strokeWidthA" />
        <polyline
          :points="pathPointsB"
          :stroke-width="strokeWidthB" />
        <polyline
          :points="pathPointsC"
          :stroke-width="strokeWidthC" />
      </g>
      <g transform="rotate(170)">
        <polyline
          :points="pathPointsA"
          :stroke-width="strokeWidthA" />
        <polyline
          :points="pathPointsB"
          :stroke-width="strokeWidthB" />
        <polyline
          :points="pathPointsC"
          :stroke-width="strokeWidthC" />
      </g>
    </g>
    <g
      :transform="`translate(${width / 2}, ${height / 2})`">
      <polygon
        fill="#41EDC1"
        stroke="none"
        :points="pathPointsOrigin" />
      <polygon
        stroke="#41EDC1"
        stroke-width="1"
        stroke-dasharray="4,2"
        fill="none"
        :points="pathPointsOriginOuter" />
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
  pointsAttr,
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
      const target = (0.5 + Math.random() * 0.5)
      const samples = (new Array(count))
        .fill(0)
        .map((n, i) => (
          Math.pow(i / (count - 1), 2) * target) +
          (Math.random() * 2 - 1) * 0.05
        )
      samples.unshift(0)
      return samples
    },

    genPathPoints (width, height, padWidth, padHeight) {
      const pathSamples = this.genPathSamples()
      const count = pathSamples.length
      return pointsAttr(pathSamples
        .map((n, i) => ([
          mapLinear(0, count - 1, padWidth, width - padWidth, i),
          mapLinear(0, 1, 0, height - padHeight, n)
        ])))
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
      return this.genEndPoints(0, 0, 3)
    },

    pathPointsOriginOuter () {
      return this.genEndPoints(0, 0, 5)
    },

    pathPointsA () {
      return this.genPathPoints(
        this.width * 0.5, this.height * 0.6, 0, 2)
    },

    pathPointsB () {
      return this.genPathPoints(
        this.width * 0.4, this.height * 0.6, 0, 2)
    },

    pathPointsC () {
      return this.genPathPoints(
        this.width * 0.3, this.height * 0.6, 0, 2)
    },

    strokeWidth () {
      const { thickness } = this.model
      return mapLinear(0, 5, 0, 7, thickness)
    },

    strokeWidthA () {
      return this.modStrokeWidth(-0.3)
    },

    strokeWidthB () {
      return this.modStrokeWidth(0)
    },

    strokeWidthC () {
      return this.modStrokeWidth(0.6)
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
          return '2, 3'
        case 2:
          return '3, 2'
        case 3:
          return '2, 3, 2, 1'
      }
    }
  }
}
</script>
