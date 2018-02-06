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
import constraintsIcon from '@/assets/icons/constraints.svg'
import drawIcon from '@/assets/icons/draw.svg'
import effectsIcon from '@/assets/icons/effects.svg'
import forcesIcon from '@/assets/icons/forces.svg'
import geometryIcon from '@/assets/icons/geometry.svg'
import minusIcon from '@/assets/icons/minus.svg'
import plusIcon from '@/assets/icons/plus.svg'
import selectIcon from '@/assets/icons/select.svg'
import stylesIcon from '@/assets/icons/styles.svg'
import toolIcon from '@/assets/icons/tool.svg'

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
    toolIcon
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
