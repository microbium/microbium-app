<template>
  <svg class="palette-constraint-preview"
    :width="width" :height="height">
    <g v-if="isDynamic"
      stroke="#fff"
      stroke-width="1"
      fill="none"
      :transform="`translate(0, ${height / 2})`">
      <polygon
        :points="genEndPoints(6, 0, 3)" />
      <polygon
        fill="#fff"
        :points="genEndPoints(width - 6, 0, 3)" />
      <polyline
        stroke-dasharray="3,2"
        :points="coreSegmentPoints" />
      <polyline
        stroke="#41EDC1"
        stroke-width="3"
        stroke-linecap="round"
        :points="slipSegmentPoints" />
      <path v-if="isEngine"
        stroke-dasharray="2,2"
        :d="engineFlexPath" />
    </g>
    <g v-else
      stroke="#fff"
      stroke-width="1"
      fill="none"
      :transform="`translate(${width / 2}, ${height / 2})`">
      <polygon
        :points="genEndPoints(-10, 0, 3)" />
      <polygon
        :points="genEndPoints(0, 0, 3)" />
      <polygon
        fill="#fff"
        :points="genEndPoints(10, 0, 3)" />
    </g>
  </svg>
</template>

<style lang="scss">
.palette-constraint-preview {
  display: block;
  margin: 0 8px;
}
</style>

<script>
import {
  // clamp,
  mapLinear
} from '@src/utils/math'
import {
  pointsAttr,
  pointsCircle
} from '@src/utils/svg'

export default {
  name: 'palette-constraint-preview',

  props: {
    model: Object,
    width: Number,
    height: Number
  },

  methods: {
    genEndPoints: pointsCircle.bind(null, 4),

    genSegmentPoints (x0, x1) {
      return pointsAttr([
        [x0, 0],
        [x1, 0]
      ])
    }
  },

  computed: {
    isDynamic () {
      return this.model.typeIndex > 0
    },

    isEngine () {
      return this.model.typeIndex === 2
    },

    coreSegmentPoints () {
      const { width } = this
      const offset = 9
      return this.genSegmentPoints(offset, width - offset)
    },

    slipSegmentPoints () {
      const { width } = this
      const { slipTolerance } = this.model
      const offset = 12
      const innerOffset = offset + (width * 0.5 - offset) * slipTolerance
      return this.genSegmentPoints(innerOffset, width - innerOffset)
    },

    engineFlexPath () {
      const { width } = this
      const { engineCadence, engineFlex, slipTolerance } = this.model
      const offset = 6
      const innerOffset = offset + (width * 0.5 - offset) * slipTolerance
      const bendX = innerOffset + width * 0.3
      const bendY = mapLinear(0, 1, 2, 10, engineFlex)
      const bendS = mapLinear(0, 0.5, width * 0.2, 0, engineCadence)

      return `
        M ${innerOffset},0
        Q ${bendX - bendS},${bendY} ${bendX},${bendY}
        S ${bendX + bendS},${bendY} ${width - offset},0`
    }
  }
}
</script>
