<template>
  <div class="palette-force">
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
            <option v-for="forceScale in forceScales" :value="forceScale.index">
              {{ forceScale.name }}
            </option>
          </input-select>
        </b> radius scale factor
      </div>
    </div>

    <div class="palette-item">
      <input-range min="0" max="2" step="0.01" v-model="model.intensity" />
      <div class="palette-item__label">
        <b>{{ intensityName }}</b> intensity
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
    forceScales: Array
  },

  computed: {
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
