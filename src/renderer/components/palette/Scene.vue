<template>
  <div class="palette-scene">
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ model.clear.colorHex.toUpperCase() }}
          <input-color v-model="model.clear.colorHex" />
        </b> clear color
      </div>
    </div>

    <div class="palette-item">
      <input-range min="0" max="2" step="0.05" v-model="model.clear.alphaFactor" />
      <div class="palette-item__label">
        <b>{{ clearAlphaName }}</b> clear alpha
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'
import InputColor from '@/components/input/Color'
import InputRange from '@/components/input/Range'

export default {
  name: 'palette-scene',

  components: {
    InputColor,
    InputRange
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
