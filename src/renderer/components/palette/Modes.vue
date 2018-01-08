<template>
  <div class="palette-modes">
    <div v-for="mode in modeTypes"
      class="palette-modes__toggle"
      :class="{ 'palette-modes__toggle--active': activeMode.name === mode.name }"
      @click="setActiveMode(mode.name)">
      <icon :name="mode.name" />
    </div>
  </div>
</template>

<style lang="scss">
.palette-modes {
  $icon-size: 18px;

  display: flex;
  justify-content: flex-end;

  &__toggle {
    position: relative;
    width: 24px;
    height: 100%;

    .icon {
      position: absolute;
      top: 50%;
      left: 50%;

      width: $icon-size;
      height: $icon-size;
      transform: translate(-50%, -50%);
    }

    path {
      fill: none;
      stroke: #fff;
      stroke-width: 2;
    }
  }

  &__toggle--active {
    path {
      fill: #fff;
      stroke: none;
    }
  }
}
</style>

<script>
import Icon from '@/components/display/Icon'

export default {
  name: 'palette-modes',

  props: {
    activeMode: Object,
    modeTypes: Array
  },

  components: {
    Icon
  },

  methods: {
    setActiveMode (name) {
      this.activeMode.name = name
    }
  }
}
</script>
