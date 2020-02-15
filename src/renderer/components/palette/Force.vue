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
    <div v-if="isStaticPosition">
      <div class="palette-item">
        <input-range min="-180" max="180" step="0.5" v-model="model.polarAngle" />
        <div class="palette-item__label">
          <b>{{ polarAngleName }}</b> polar angle
          <palette-item-controller :min="-180" :max="180"
            :model="model" prop="polarAngle" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="40" step="0.5" v-model="model.polarOffset" />
        <div class="palette-item__label">
          <b>{{ polarOffsetName }}</b> polar offset
          <palette-item-controller :min="0" :max="40"
            :model="model" prop="polarOffset" />
        </div>
      </div>
    </div>
    <hr />

    <!-- Intensity / Radius -->
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
    <div class="palette-item">
      <input-range min="-1" max="1" step="0.01" v-model="model.intensity" />
      <div class="palette-item__label">
        <b>{{ intensityName }}</b> intensity
        <palette-item-controller :min="-1" :max="1"
          :model="model" prop="intensity" />
      </div>
    </div>
    <div class="palette-item">
      <input-range min="2" max="60" step="0.5" v-model="model.radius" />
      <div class="palette-item__label">
        <b>{{ radiusName }}</b> radius
        <palette-item-controller :min="2" :max="60"
          :model="model" prop="radius" />
      </div>
    </div>
    <hr />
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
  name: 'palette-force',

  components: {
    InputRange,
    InputSelect,
    PaletteItemController
  },

  props: {
    model: Object,
    forceTypes: Array,
    forcePositionTypes: Array,
    forceIntensityTypes: Array
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

    isStaticPosition () {
      return this.model.positionTypeIndex === 0
    },

    polarAngleName () {
      const { polarAngle } = this.model
      return `${roundToPlaces(polarAngle, 1)}°`
    },

    polarOffsetName () {
      const { polarOffset } = this.model
      return `${roundToPlaces(polarOffset * polarOffset, 0)}pt`
    },

    radiusName () {
      const { radius } = this.model
      return `${roundToPlaces(radius * radius, 0)}pt`
    },

    intensityName () {
      const { intensity } = this.model
      return `${roundToPlaces(intensity, 3)}N`
    }
  }
}
</script>
