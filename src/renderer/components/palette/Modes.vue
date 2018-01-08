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
  margin-left: 12px;

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
      fill: #fff;;
      // stroke: #fff;
    }
  }

  &__toggle--active {
    path {
      fill: #41EDC1;
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
