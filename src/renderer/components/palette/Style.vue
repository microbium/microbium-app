<template>
  <div class="palette-style">
    <div class="palette-item">
      <input-range min="0.5" max="5" step="0.5"
        v-model="model.thickness" />
      <div class="palette-item__label">
        <b>{{ thicknessName }}</b> stroke thickness factor
      </div>
    </div>
    <div class="palette-item">
      <input-range min="0" max="2" step="0.05"
        v-model="model.thicknessModulation" />
      <div class="palette-item__label">
        <b>{{ thicknessModName }}</b> thickness modulation
      </div>
    </div>
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ model.tintHex }}
          <input-color v-model="model.tintHex" />
        </b> stroke tint
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'

import InputColor from '@/components/input/Color'
import InputRange from '@/components/input/Range'

export default {
  name: 'palette-style',

  components: {
    InputColor,
    InputRange
  },

  props: {
    model: Object
  },

  computed: {
    thicknessName () {
      const { thickness } = this.model
      return `${roundToPlaces(thickness, 1)}x`
    },

    thicknessModName () {
      const { thicknessModulation } = this.model
      return `${roundToPlaces(thicknessModulation, 2)}x`
    }
  }
}
</script>
