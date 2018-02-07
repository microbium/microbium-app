<template>
  <div class="palette-constraint">
    <!-- TODO: Disable changing constraint type while simulation is running
    -->
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
        </div>
      </div>
      <hr />
    </div>

    <div v-if="hasEngine">
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.engineFlex" />
        <div class="palette-item__label">
          <b>{{ engineFlexName }}</b> distance flex
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="0.5" step="0.01" v-model="model.engineCadence" />
        <div class="palette-item__label">
          <b>{{ engineCadenceName }}</b> flex cadence
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'
import InputRange from '@/components/input/Range'
import InputSelect from '@/components/input/Select'

export default {
  name: 'palette-constraint',

  components: {
    InputRange,
    InputSelect
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
      return `${roundToPlaces(engineCadence * 1000, 0)}ms (t)`
    },

    engineFlexName () {
      const { engineFlex } = this.model
      return `${roundToPlaces(engineFlex * 100, 0)}%`
    }
  }
}
</script>
