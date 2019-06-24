<template>
  <div class="palette-camera">
    <palette-group persistent-controls open>
      <h2 slot="title">Camera</h2>
      <input-checkbox slot="controls" v-model="model.enabled" />

      <palette-group nested open>
        <h2 slot="title">Position</h2>

        <div class="palette-item">
          <input-range min="-180" max="180" step="0.5" v-model="model.polarAngle" />
          <div class="palette-item__label">
            <b>{{ polarAngleName }}</b> polar angle
            <palette-item-controller :min="-180" :max="180"
              :model="model" prop="polarAngle" />
          </div>
        </div>
        <div class="palette-item">
          <input-range min="0" max="60" step="0.5" v-model="model.polarOffset" />
          <div class="palette-item__label">
            <b>{{ polarOffsetName }}</b> polar offset
            <palette-item-controller :min="0" :max="60"
              :model="model" prop="polarOffset" />
          </div>
        </div>
        <div class="palette-item">
          <input-range min="0" max="50" step="0.5" v-model="model.depthOffset" />
          <div class="palette-item__label">
            <b>{{ depthOffsetName }}</b> depth offset
            <palette-item-controller :min="0" :max="50"
              :model="model" prop="depthOffset" />
          </div>
        </div>
        <div class="palette-item">
          <input-range min="0" max="0.2" step="0.001" v-model="model.tweenFactor" />
          <div class="palette-item__label">
            <b>{{ tweenFactorName }}</b> tween factor
            <palette-item-controller :min="0" :max="40"
              :model="model" prop="tweenFactor" />
          </div>
        </div>
        <hr />
      </palette-group>
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@renderer/utils/number'

import InputCheckbox from '@renderer/components/input/Checkbox'
import InputRange from '@renderer/components/input/Range'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteItemController from '@renderer/components/palette/ItemController'

export default {
  name: 'palette-viewport',

  components: {
    InputCheckbox,
    InputRange,
    PaletteGroup,
    PaletteItemController
  },

  props: {
    model: Object
  },

  computed: {
    polarAngleName () {
      const { polarAngle } = this.model
      return `${roundToPlaces(polarAngle, 1)}°`
    },

    polarOffsetName () {
      const { polarOffset } = this.model
      return `${roundToPlaces(polarOffset * polarOffset, 0)}pt`
    },

    depthOffsetName () {
      const { depthOffset } = this.model
      return `${roundToPlaces(depthOffset * depthOffset, 0)}pt`
    },

    tweenFactorName () {
      const { tweenFactor } = this.model
      return `${roundToPlaces(tweenFactor * 100, 1)}%`
    }
  }
}
</script>
