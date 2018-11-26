<template>
  <div class="palette-simulation">
    <palette-group open>
      <h2 slot="title">Simulation</h2>

      <div class="palette-item">
        <input-range min="0" max="2" step="0.01" v-model="model.speed" />
        <div class="palette-item__label">
          <b>{{ simulationSpeedName }}</b> speed
          <palette-item-controller :min="0" :max="2"
            :model="model" prop="speed" />
        </div>
      </div>
      <hr />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@renderer/utils/number'
import InputRange from '@renderer/components/input/Range'
import PaletteGroup from '@renderer/components/palette/Group'

export default {
  name: 'palette-simulation',

  props: {
    model: Object
  },

  components: {
    InputRange,
    PaletteGroup
  },

  computed: {
    simulationSpeedName () {
      const { speed } = this.model
      return `${roundToPlaces(speed, 2)}x`
    }
  }
}
</script>
