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
      <input-range min="0" max="5" step="0.1"
        v-model="model.strokeWidthMod" />
      <div class="palette-item__label">
        <b>{{ strokeModName }}</b>
        <abbr title="Pressure sensitivity modulation">stroke width modulation</abbr>
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

    strokeModName () {
      const { strokeWidthMod } = this.model
      return `${roundToPlaces(strokeWidthMod, 1)}x`
    }
  }
}
</script>
