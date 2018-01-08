<template>
  <component class="icon" :is="iconName" />
</template>

<style lang="scss">
.icon {}
</style>

<script>
import drawIcon from '@/assets/icons/draw.svg'
import selectIcon from '@/assets/icons/select.svg'

export default {
  name: 'icon',

  props: {
    name: String
  },

  components: {
    drawIcon,
    selectIcon
  },

  computed: {
    iconName () {
      return this.name + 'Icon'
    }
  }
}
</script>
