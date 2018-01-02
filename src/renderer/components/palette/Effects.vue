<template>
  <div class="palette-effects">
    <palette-group nested>
      <h2 slot="title">Background</h2>
      <div class="palette-item">
        <input-range min="0" max="2" step="0.05" v-model="model.clearAlphaFactor" />
        <div class="palette-item__label">
          <b>{{ clearAlphaName }}</b> clear alpha
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="5" step="0.05" v-model="model.noiseIntensityFactor" />
        <div class="palette-item__label">
          <b>{{ noiseFactorName }}</b> noise intensity
        </div>
      </div>
    </palette-group>

    <palette-group nested>
      <h2 slot="title">Bloom</h2>
      <div class="palette-item">
        <input-range min="0" max="2" step="0.05" v-model="model.bloomIntensityFactor" />
        <div class="palette-item__label">
          <b>{{ bloomFactorName }}</b> bloom intensity
        </div>
      </div>
    </palette-group>

    <palette-group nested>
      <h2 slot="title">Color Shift</h2>
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.colorShift[0]" />
        <div class="palette-item__label">
          <b>{{ colorShiftHueName }}</b> hue
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift[1]" />
        <div class="palette-item__label">
          <b>{{ colorShiftSatName }}</b> saturation
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift[2]" />
        <div class="palette-item__label">
          <b>{{ colorShiftValName }}</b> value
        </div>
      </div>
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'
import InputRange from '@/components/input/Range'
import PaletteGroup from '@/components/palette/Group'

export default {
  name: 'palette-effects',

  components: {
    InputRange,
    PaletteGroup
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
    },

    colorShiftHueName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift[0] * 360, 1)}`
    },

    colorShiftSatName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift[1] * 100, 1)}%`
    },

    colorShiftValName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift[2] * 100, 1)}%`
    }
  }
}
</script>
