<template>
  <div class="editor-cursor"
    :style="baseStyle">
    <svg class="editor-cursor__vis" width="70" height="70">
      <g class="editor-cursor__vis__stroke" transform="translate(35, 35)">
        <polygon stroke-width="1"
          :points="strokeWidthPoints" />
        <polyline stroke-width="2"
          :transform="`scale(${strokeWidthModScale})`"
          :points="strokeWidthModPoints" />
      </g>
    </svg>
  </div>
</template>

<style lang="scss">
.editor-cursor {
  position: absolute;
  top: 0;
  left: 0;

  background: transparent;
  margin: -35px 0 0 -35px;
  width: 70px;
  height: 70px;

  pointer-events: none;

  &__vis {
    position: absolute;
    top: 0;
    left: 0;

    &__stroke {
      fill: none;
      stroke: #fff;
      stroke-width: 2;
    }

    &__constraint {
      fill: none;
      stroke: #fff;
      stroke-width: 1;
    }
  }
}
</style>

<script>
import { mapLinear } from '@src/utils/math'
import { pointsArc, pointsCircle } from '@src/utils/svg'

export default {
  name: 'editor-cursor',

  props: {
    model: Object,
    visible: Boolean
  },

  computed: {
    baseStyle () {
      const { visible } = this
      if (!visible) {
        return {
          display: 'none'
        }
      }

      const { seekPosition } = this.model
      return {
        willChange: 'transform',
        transform: `translate3d(${seekPosition[0]}px, ${seekPosition[1]}px, 0)`
      }
    },

    strokeWidthRadius () {
      const { strokeWidth } = this.model
      return mapLinear(0, 25, 4, 18, strokeWidth ** 2)
    },

    strokeWidthPoints () {
      const { strokeWidthRadius } = this
      const { constraintType } = this.model
      const precision = constraintType === 0 ? 4 : 9
      return pointsCircle(precision, 0, 0, strokeWidthRadius)
    },

    strokeWidthModScale () {
      const { strokeWidthMod } = this.model
      return mapLinear(-1, 1, 0.5, 1.75, strokeWidthMod)
    },

    strokeWidthModPoints () {
      const { strokeWidthRadius } = this
      const { constraintType } = this.model
      switch (constraintType) {
        case 0:
          return pointsArc(2, 0, 0, strokeWidthRadius,
            Math.PI * 2 * (2 / 4),
            Math.PI * 2 * (4 / 4))
        default:
          return pointsArc(3, 0, 0, strokeWidthRadius,
            Math.PI * 2 * (4 / 9),
            Math.PI * 2 * (7 / 9))
      }
    }
  }
}
</script>
