<template>
  <component class="icon" :style="iconSize" :is="iconName" />
</template>

<style lang="scss">
.icon {
  display: block;
}
</style>

<script>
// TODO: Improve linking icon assets
import constraintsIcon from '@src/assets/icons/constraints.svg'
import drawIcon from '@src/assets/icons/draw.svg'
import effectsIcon from '@src/assets/icons/effects.svg'
import forcesIcon from '@src/assets/icons/forces.svg'
import geometryIcon from '@src/assets/icons/geometry.svg'
import minusIcon from '@src/assets/icons/minus.svg'
import plusIcon from '@src/assets/icons/plus.svg'
import selectIcon from '@src/assets/icons/select.svg'
import stylesIcon from '@src/assets/icons/styles.svg'
import toolIcon from '@src/assets/icons/tool.svg'
import viewportIcon from '@src/assets/icons/viewport.svg'

export default {
  name: 'icon',

  props: {
    name: String,
    size: Number
  },

  components: {
    constraintsIcon,
    drawIcon,
    effectsIcon,
    forcesIcon,
    geometryIcon,
    minusIcon,
    plusIcon,
    selectIcon,
    stylesIcon,
    toolIcon,
    viewportIcon
  },

  computed: {
    iconName () {
      return this.name + 'Icon'
    },

    iconSize () {
      const { size } = this
      if (!size) return
      const sizePx = `${size}px`
      return {
        width: sizePx,
        height: sizePx
      }
    }
  }
}
</script>
