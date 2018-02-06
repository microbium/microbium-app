<template>
  <div class="palette-modifiers">
    <palette-group nested open>
      <h2 slot="title">Curve Generator</h2>

      <div class="palette-item">
        <input-range min="0" max="20" step="1" v-model="model.curve.segMinLength" />
        <div class="palette-item__label">
          <b>{{ curveSegMinLengthName }}</b> min length
        </div>
      </div>

      <div class="palette-item">
        <input-range min="10" max="30" step="1" v-model="model.curve.segMaxLength" />
        <div class="palette-item__label">
          <b>{{ curveSegMaxLengthName }}</b> max length
        </div>
      </div>

      <div class="palette-item">
        <input-range min="1" max="12" v-model="model.curve.subDivisions" />
        <div class="palette-item__label">
          <b>{{ curveSubDivisionsName }}</b> segment subdivisions
        </div>
      </div>
    </palette-group>

    <palette-group nested open>
      <h2 slot="title">Polar Generator</h2>

      <div class="palette-item">
        <input-range min="1" max="32" v-model="model.polarIterations" />
        <div class="palette-item__label">
          <b>{{ polarIterationsName }}</b> iterations
        </div>
      </div>
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { numberToWords, roundToPlaces } from '@/utils/number'
import InputRange from '@/components/input/Range'
import PaletteGroup from '@/components/palette/Group'

export default {
  name: 'palette-modifiers',

  components: {
    InputRange,
    PaletteGroup
  },

  props: {
    model: Object
  },

  computed: {
    curveSegMinLengthName () {
      const { segMinLength } = this.model.curve
      return `${roundToPlaces(segMinLength, 0)}pt`
    },

    curveSegMaxLengthName () {
      const { segMaxLength } = this.model.curve
      return `${roundToPlaces(segMaxLength * 10, 0)}pt`
    },

    curveSubDivisionsName () {
      const { subDivisions } = this.model.curve
      return numberToWords(subDivisions)
    },

    polarIterationsName () {
      const { polarIterations } = this.model
      return numberToWords(polarIterations)
    }
  }
}
</script>
