<template>
  <div class="palette-effects">
    <palette-group nested open>
      <h2 slot="title">Bloom</h2>

      <div class="palette-item">
        <input-range min="0" max="2" step="0.05" v-model="model.bloom.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ bloomFactorName }}</b> intensity
        </div>
      </div>

      <div class="palette-item">
        <input-range min="0" max="6" step="1" v-model="model.bloom.blurPasses" />
        <div class="palette-item__label">
          <b>{{ bloomBlurPassesName }}</b> blur passes
        </div>
      </div>

      <div class="palette-item">
        <input-range min="1" max="20" step="1" v-model="model.bloom.blurStep" />
        <div class="palette-item__label">
          <b>{{ bloomBlurStepName }}</b> blur radius interval
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

    <palette-group nested>
      <h2 slot="title">Noise</h2>

      <div class="palette-item">
        <input-range min="0" max="5" step="0.05" v-model="model.noise.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ noiseFactorName }}</b> intensity
        </div>
      </div>
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'
import InputColor from '@/components/input/Color'
import InputRange from '@/components/input/Range'
import PaletteGroup from '@/components/palette/Group'

export default {
  name: 'palette-effects',

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
    },

    noiseFactorName () {
      const { noise } = this.model
      return `${roundToPlaces(noise.intensityFactor, 2)}x`
    },

    bloomFactorName () {
      const { bloom } = this.model
      return `${roundToPlaces(bloom.intensityFactor, 2)}x`
    },

    bloomBlurPassesName () {
      const { bloom } = this.model
      return bloom.blurPasses
    },

    bloomBlurStepName () {
      const { bloom } = this.model
      return `${bloom.blurStep}px`
    },

    colorShiftHueName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift[0] * 360, 1)}°`
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
