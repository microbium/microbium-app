<template>
  <div class="palette-effects">
    <div class="palette-item">
      <input-range min="0" max="2" step="0.05" v-model="model.clearAlphaFactor" />
      <div class="palette-item__label">
        <b>{{ clearAlphaName }}</b> clear alpha
      </div>
    </div>
    <div class="palette-item">
      <input-range min="0" max="2" step="0.05" v-model="model.bloomIntensityFactor" />
      <div class="palette-item__label">
        <b>{{ bloomFactorName }}</b> bloom intensity
      </div>
    </div>
    <div class="palette-item">
      <input-range min="0" max="5" step="0.05" v-model="model.noiseIntensityFactor" />
      <div class="palette-item__label">
        <b>{{ noiseFactorName }}</b> noise intensity
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'
import InputRange from '@/components/input/Range'

export default {
  name: 'palette-effects',

  components: {
    InputRange
  },

  props: {
    model: Object
  },

  computed: {
    clearAlphaName () {
      const { clearAlphaFactor } = this.model
      return `${roundToPlaces(clearAlphaFactor, 2)}x`
    },

    bloomFactorName () {
      const { bloomIntensityFactor } = this.model
      return `${roundToPlaces(bloomIntensityFactor, 2)}x`
    },

    noiseFactorName () {
      const { noiseIntensityFactor } = this.model
      return `${roundToPlaces(noiseIntensityFactor, 2)}x`
    }
  }
}
</script>
