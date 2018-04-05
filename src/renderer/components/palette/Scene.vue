<template>
  <div class="palette-scene">
    <palette-group nested open>
      <h2 slot="title">Background</h2>

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ model.clear.colorHex.toUpperCase() }}
            <input-color v-model="model.clear.colorHex" />
          </b> color
        </div>
      </div>

      <div class="palette-item">
        <input-range min="0" max="2" step="0.05" v-model="model.clear.alphaFactor" />
        <div class="palette-item__label">
          <b>{{ clearAlphaName }}</b> fade out
        </div>
      </div>
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@src/utils/number'
import InputColor from '@src/components/input/Color'
import InputRange from '@src/components/input/Range'
import PaletteGroup from '@src/components/palette/Group'

export default {
  name: 'palette-scene',

  components: {
    InputColor,
    InputRange,
    PaletteGroup
  },

  props: {
    model: Object
  },

  computed: {
    clearAlphaName () {
      const { clear } = this.model
      return `${roundToPlaces(clear.alphaFactor, 2)}x`
    }
  }
}
</script>
