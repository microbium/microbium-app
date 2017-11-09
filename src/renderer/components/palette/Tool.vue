<template>
  <div class="palette-tool">
    <div class="palette-item">
      <input-range min="0.25" max="18" step="0.25" v-model="model.strokeWidth"></input-range>
      <div class="palette-item__label">
        <b>{{ strokeWidthName }}</b> stroke width
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
        </b> style
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
    styles: Array
  },

  computed: {
    strokeWidthName () {
      const { strokeWidth } = this.model
      return `${roundToPlaces(strokeWidth, 2)}px`
    },

    strokeStyleName () {
      const style = this.styles[this.model.styleIndex]
      return style.name
    }
  }
}
</script>
