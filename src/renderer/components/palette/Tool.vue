<template>
  <div class="palette-tool">
    <div class="palette-item">
      <input-range min="0.25" max="18" step="0.25" v-model="model.strokeWidth" />
      <div class="palette-item__label">
        <b>{{ strokeWidthName }}</b> stroke width
      </div>
    </div>

    <div class="palette-item">
      <input-range class="range-slider--knob-hidden"
        min="-1" max="1" step="0.025" v-model="model.strokeWidthMod" />
      <div class="palette-item__label">
        <b>{{ inputModTypeName }}
          <input-select v-model="model.inputModTypeIndex">
            <option v-for="inputModType in inputModTypes" :value="inputModType.index">
              {{ inputModType.name }}
            </option>
          </input-select>
        </b> stroke modulation
      </div>
    </div>

    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ model.strokeColor.toUpperCase() }}
          <input-color v-model="model.strokeColor" />
        </b> stroke color
      </div>
    </div>

    <div class="palette-item">
      <input-range min="0" max="1" step="0.01" v-model="model.strokeAlpha" />
      <div class="palette-item__label">
        <b>{{ strokeAlphaName }}</b> stroke opacity
      </div>
    </div>

    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ strokeStyleName }}
          <input-select v-model="model.styleIndex">
            <option v-for="style in styles" :value="style.index">
              {{ style.name }}
            </option>
          </input-select>
        </b> style layer
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'

import InputColor from '@/components/input/Color'
import InputSelect from '@/components/input/Select'
import InputRange from '@/components/input/Range'

export default {
  name: 'palette-tool',

  components: {
    InputColor,
    InputSelect,
    InputRange
  },

  props: {
    model: Object,
    styles: Array,
    inputModTypes: Array
  },

  computed: {
    strokeWidthName () {
      const { strokeWidth } = this.model
      return `${roundToPlaces(strokeWidth, 2)}pt`
    },

    inputModTypeName () {
      const inputModType = this.inputModTypes[this.model.inputModTypeIndex]
      return inputModType.name
    },

    strokeAlphaName () {
      const { strokeAlpha } = this.model
      return `${roundToPlaces(strokeAlpha * 100, 0)}%`
    },

    strokeStyleName () {
      const style = this.styles[this.model.styleIndex]
      return style.name
    }
  }
}
</script>
