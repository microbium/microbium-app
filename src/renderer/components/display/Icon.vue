<template>
  <component class="icon" :is="iconName" />
</template>

<style lang="scss">
.icon {}
</style>

<script>
// TODO: Improve linking icon assets
// TODO: Improve icon designs
import drawIcon from '@/assets/icons/draw.svg'
import selectIcon from '@/assets/icons/select.svg'
import geometryIcon from '@/assets/icons/geometry.svg'
import forcesIcon from '@/assets/icons/forces.svg'
import effectsIcon from '@/assets/icons/effects.svg'

export default {
  name: 'icon',

  props: {
    name: String
  },

  components: {
    drawIcon,
    selectIcon,
    geometryIcon,
    forcesIcon,
    effectsIcon
  },

  computed: {
    iconName () {
      return this.name + 'Icon'
    }
  }
}
</script>
