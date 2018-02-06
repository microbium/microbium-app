<template>
  <div class="palette-tool">
    <palette-group nested open>
      <h2 slot="title">Stroke Weight</h2>

      <div class="palette-item">
        <input-range min="0.25" max="18" step="0.25" v-model="model.strokeWidth" />
        <div class="palette-item__label">
          <b>{{ strokeWidthName }}</b> base width
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
          </b> width modulation
        </div>
      </div>
    </palette-group>

    <palette-group nested open>
      <h2 slot="title">Appearance</h2>

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
    </palette-group>

    <palette-group nested open>
      <h2 slot="title">Behavior</h2>

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ strokeConstraintName }}
            <input-select v-model="model.constraintIndex">
              <option v-for="constraint in constraints" :value="constraint.index">
                {{ constraint.name }}
              </option>
            </input-select>
          </b> simulation constraint
        </div>
      </div>
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'

import InputColor from '@/components/input/Color'
import InputSelect from '@/components/input/Select'
import InputRange from '@/components/input/Range'
import PaletteGroup from '@/components/palette/Group'

export default {
  name: 'palette-tool',

  components: {
    InputColor,
    InputSelect,
    InputRange,
    PaletteGroup
  },

  props: {
    model: Object,
    styles: Array,
    constraints: Array,
    inputModTypes: Array,
    physicsTypes: Array
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
    },

    strokeConstraintName () {
      const type = this.constraints[this.model.constraintIndex]
      return type.name
    }
  }
}
</script>
