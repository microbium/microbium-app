<template>
  <div class="palette-force">
    <!-- Type -->
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ typeName }}
          <input-select v-model="model.typeIndex">
            <option v-for="item in forceTypes" :value="item.index">
              {{ item.name }}
            </option>
          </input-select>
        </b> force
      </div>
    </div>
    <hr />

    <!-- Position -->
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ positionTypeName }}
          <input-select v-model="model.positionTypeIndex">
            <option v-for="item in forcePositionTypes" :value="item.index">
              {{ item.name }}
            </option>
          </input-select>
        </b> position mapping
      </div>
    </div>
    <hr />

    <!-- Radius -->
    <div class="palette-item">
      <input-range min="0" max="10" step="0.01" v-model="model.radius" />
      <div class="palette-item__label">
        <b>{{ radiusName }}</b> radius
      </div>
    </div>
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ radiusScaleName }}
          <input-select v-model="model.radiusScaleIndex">
            <option v-for="item in forceScales" :value="item.index">
              {{ item.name }}
            </option>
          </input-select>
        </b> radius scale factor
      </div>
    </div>
    <hr />

    <!-- Intensity -->
    <div class="palette-item">
      <input-range min="-2" max="2" step="0.01" v-model="model.intensity" />
      <div class="palette-item__label">
        <b>{{ intensityName }}</b> intensity
      </div>
    </div>
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ intensityTypeName }}
          <input-select v-model="model.intensityTypeIndex">
            <option v-for="item in forceIntensityTypes" :value="item.index">
              {{ item.name }}
            </option>
          </input-select>
        </b> intensity mapping
      </div>
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
  name: 'palette-force',

  components: {
    InputRange,
    InputSelect
  },

  props: {
    model: Object,
    forceTypes: Array,
    forcePositionTypes: Array,
    forceIntensityTypes: Array,
    forceScales: Array
  },

  computed: {
    typeName () {
      const { typeIndex } = this.model
      const forceType = this.forceTypes[typeIndex]
      return forceType.name
    },

    positionTypeName () {
      const { positionTypeIndex } = this.model
      const positionType = this.forcePositionTypes[positionTypeIndex]
      return positionType.name
    },

    intensityTypeName () {
      const { intensityTypeIndex } = this.model
      const intensityType = this.forceIntensityTypes[intensityTypeIndex]
      return intensityType.name
    },

    radiusName () {
      const { radius, radiusScaleIndex } = this.model
      const radiusScale = this.forceScales[radiusScaleIndex]
      return `${roundToPlaces(radius * radiusScale.value, 0)}px`
    },

    radiusScaleName () {
      const forceScale = this.forceScales[this.model.radiusScaleIndex]
      return forceScale.name
    },

    intensityName () {
      const { intensity } = this.model
      return `${roundToPlaces(intensity, 3)}N`
    }
  }
}
</script>
