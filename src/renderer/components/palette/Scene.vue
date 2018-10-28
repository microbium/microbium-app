<template>
  <div class="palette-scene">
    <palette-group open>
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
import { roundToPlaces } from '@renderer/utils/number'
import InputColor from '@renderer/components/input/Color'
import InputRange from '@renderer/components/input/Range'
import PaletteGroup from '@renderer/components/palette/Group'

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
