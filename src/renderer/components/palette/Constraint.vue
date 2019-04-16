<template>
  <div class="palette-constraint">
    <!-- TODO: Disable changing constraint type while simulation is running -->
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ typeName }}
          <input-select v-model="model.typeIndex">
            <option v-for="type in constraintTypes" :value="type.index">
              {{ type.name }}
            </option>
          </input-select>
        </b> constraint
      </div>
    </div>
    <hr />

    <div v-if="hasSlipTolerance">
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.slipTolerance" />
        <div class="palette-item__label">
          <b>{{ slipToleranceName }}</b> slip tolerance
          <palette-item-controller :min="0" :max="1"
            :model="model" prop="slipTolerance" />
        </div>
      </div>
      <hr />
    </div>

    <div v-if="hasEngine">
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.engineFlex" />
        <div class="palette-item__label">
          <b>{{ engineFlexName }}</b> distance flex
          <palette-item-controller :min="0" :max="1"
            :model="model" prop="engineFlex" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="20" max="400" step="5" v-model="model.engineCadence" />
        <div class="palette-item__label">
          <b>{{ engineCadenceName }}</b> flex cadence
          <palette-item-controller :min="20" :max="400"
            :model="model" prop="engineCadence" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="10" step="0.25" v-model="model.engineCadenceDelay" />
        <div class="palette-item__label">
          <b>{{ engineCadenceDelayName }}</b> instance flex delay
          <palette-item-controller :min="0" :max="10"
            :model="model" prop="engineCadenceDelay" />
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@renderer/utils/number'
import InputRange from '@renderer/components/input/Range'
import InputSelect from '@renderer/components/input/Select'
import PaletteItemController from '@renderer/components/palette/ItemController'

export default {
  name: 'palette-constraint',

  components: {
    InputRange,
    InputSelect,
    PaletteItemController
  },

  props: {
    model: Object,
    constraintTypes: Array
  },

  computed: {
    hasSlipTolerance () {
      return this.model.typeIndex >= 1
    },

    hasEngine () {
      return this.model.typeIndex === 2
    },

    typeName () {
      const { typeIndex } = this.model
      const type = this.constraintTypes[typeIndex]
      return type.name
    },

    slipToleranceName () {
      const { slipTolerance } = this.model
      return `${roundToPlaces(slipTolerance * 100, 0)}%`
    },

    engineCadenceName () {
      const { engineCadence } = this.model
      return `${roundToPlaces(engineCadence, 0)} bpm`
    },

    engineCadenceDelayName () {
      const { engineCadenceDelay } = this.model
      return `${roundToPlaces(engineCadenceDelay, 2)}x bpm`
    },

    engineFlexName () {
      const { engineFlex } = this.model
      return `${roundToPlaces(engineFlex * 100, 0)}%`
    }
  }
}
</script>
