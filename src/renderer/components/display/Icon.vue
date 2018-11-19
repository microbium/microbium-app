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
import constraintsIcon from '@renderer/assets/icons/constraints.svg'
import drawIcon from '@renderer/assets/icons/draw.svg'
import effectsIcon from '@renderer/assets/icons/effects.svg'
import forcesIcon from '@renderer/assets/icons/forces.svg'
import geometryIcon from '@renderer/assets/icons/geometry.svg'
import minusIcon from '@renderer/assets/icons/minus.svg'
import plusIcon from '@renderer/assets/icons/plus.svg'
import selectIcon from '@renderer/assets/icons/select.svg'
import stylesIcon from '@renderer/assets/icons/styles.svg'
import toolIcon from '@renderer/assets/icons/tool.svg'
import viewportIcon from '@renderer/assets/icons/viewport.svg'

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
