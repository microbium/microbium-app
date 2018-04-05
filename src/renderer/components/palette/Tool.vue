<template>
  <div class="palette-tool">
    <palette-group nested persistent-controls open>
      <h2 slot="title">Appearance</h2>

      <!-- TODO: Reflect stroke width, color, opacity in preview -->
      <palette-style-preview slot="controls"
        :model="segmentStyle" :width="80" :height="22" :segments="5" />

      <!-- Style type -->
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
      <hr />

      <!-- Stroke width -->
      <div class="palette-item">
        <input-range min="0.1" max="5" step="0.01" v-model="model.strokeWidth" />
        <div class="palette-item__label">
          <b>{{ strokeWidthName }}</b> base width
        </div>
      </div>
      <div class="palette-item">
        <input-range class="range-slider--knob-hidden"
          min="-1" max="1" step="0.001" v-model="model.strokeWidthMod" />
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
      <hr />

      <!-- Stroke color -->
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
      <hr />
    </palette-group>

    <palette-group nested persistent-controls open>
      <h2 slot="title">Behavior</h2>

      <palette-constraint-preview slot="controls"
        :model="segmentConstraint" :width="80" :height="22" />

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
      <hr />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@src/utils/number'

import InputColor from '@src/components/input/Color'
import InputSelect from '@src/components/input/Select'
import InputRange from '@src/components/input/Range'
import PaletteGroup from '@src/components/palette/Group'
import PaletteConstraintPreview from '@src/components/palette/ConstraintPreview'
import PaletteStylePreview from '@src/components/palette/StylePreview'

export default {
  name: 'palette-tool',

  components: {
    InputColor,
    InputSelect,
    InputRange,
    PaletteGroup,
    PaletteConstraintPreview,
    PaletteStylePreview
  },

  props: {
    model: Object,
    styles: Array,
    constraints: Array,
    inputModTypes: Array,
    physicsTypes: Array
  },

  computed: {
    segmentStyle () {
      return this.styles[this.model.styleIndex]
    },

    segmentConstraint () {
      return this.constraints[this.model.constraintIndex]
    },

    strokeWidthName () {
      const { strokeWidth } = this.model
      return `${roundToPlaces(strokeWidth * strokeWidth, 2)}pt`
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
