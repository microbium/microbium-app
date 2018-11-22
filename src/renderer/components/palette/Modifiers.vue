<template>
  <div class="palette-modifiers">
    <palette-group open>
      <h2 slot="title">Curve Generator</h2>

      <div class="palette-item">
        <input-range min="0" max="20" step="1" v-model="model.curve.segMinLength" />
        <div class="palette-item__label">
          <b>{{ curveSegMinLengthName }}</b> min length
        </div>
      </div>
      <div class="palette-item">
        <input-range min="2" max="16" step="1" v-model="model.curve.segMaxLength" />
        <div class="palette-item__label">
          <b>{{ curveSegMaxLengthName }}</b> max length
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="1" max="12" v-model="model.curve.subDivisions" />
        <div class="palette-item__label">
          <b>{{ curveSubDivisionsName }}</b> {{ curveSubDivisionsLabel }}
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group open>
      <h2 slot="title">Polar Generator</h2>

      <div class="palette-item">
        <input-range min="1" max="11" v-model="model.polarIterations" />
        <div class="palette-item__label">
          <b>{{ polarIterationsName }}</b> {{ polarIterationsLabel }}
          <palette-item-controller :min="1" :max="11"
            :model="model" prop="polarIterations" />
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group open>
      <h2 slot="title">Mirror Generator</h2>

      <div class="palette-item">
        <input-range min="0" max="1" step="0.05" v-model="model.mirror.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ mirrorFactorName }}</b> intensity
          <palette-item-controller :min="0" :max="1"
            :model="model.mirror" prop="intensityFactor" />
        </div>
      </div>
      <hr />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import {
  numberToWords,
  roundToPlaces
} from '@renderer/utils/number'
import { pluralize } from '@renderer/utils/word'

import InputRange from '@renderer/components/input/Range'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteItemController from '@renderer/components/palette/ItemController'

export default {
  name: 'palette-modifiers',

  components: {
    InputRange,
    PaletteGroup,
    PaletteItemController
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

    curveSubDivisionsLabel () {
      const { subDivisions } = this.model.curve
      return `segment ${pluralize(subDivisions, 'subdivision', 'subdivisions')}`
    },

    polarIterationsName () {
      const { polarIterations } = this.model
      return numberToWords(polarIterations)
    },

    polarIterationsLabel () {
      const { polarIterations } = this.model
      return pluralize(polarIterations, 'iteration', 'iterations')
    },

    mirrorFactorName () {
      const { mirror } = this.model
      return `${roundToPlaces(mirror.intensityFactor, 2)}x`
    }
  }
}
</script>
