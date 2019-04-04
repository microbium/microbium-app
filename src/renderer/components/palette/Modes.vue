<template>
  <div class="palette-modes">
    <div v-for="mode in modeTypes"
      class="palette-modes__toggle"
      :class="{ 'palette-modes__toggle--active': activeMode.id === mode.id }"
      :title="mode.name"
      @click="setActiveMode(mode.id)">
      <icon :name="mode.id" :size="18" />
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 100%;
    -webkit-app-region: no-drag;

    path {
      stroke: #fff;
    }
  }

  &__toggle--active {
    path {
      stroke: var(--highlight-color);
    }
  }
}
</style>

<script>
import Icon from '@renderer/components/display/Icon'

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
    setActiveMode (id) {
      this.activeMode.id = id
    }
  }
}
</script>
