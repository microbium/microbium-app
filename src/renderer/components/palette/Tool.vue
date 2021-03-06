<template>
  <div class="palette-tool">
    <palette-group persistent-controls open>
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
          <palette-item-controller :min="0.1" :max="5" :step="0.01"
            :model="model" prop="strokeWidth" />
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

      <!-- Depth -->
      <div class="palette-item">
        <input-range min="-100" max="100" step="0.5" v-model="model.depth" />
        <div class="palette-item__label">
          <b>{{ depthName }}</b> depth
          <palette-item-controller :min="-100" :max="100" :step="0.5"
            :model="model" prop="depth" />
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
          <palette-item-controller :min="0" :max="1" :step="0.01"
            :model="model" prop="strokeAlpha" />
        </div>
      </div>
      <hr />

      <!-- Fill color -->
      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ model.fillColor.toUpperCase() }}
            <input-color v-model="model.fillColor" />
          </b> fill color
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.fillAlpha" />
        <div class="palette-item__label">
          <b>{{ fillAlphaName }}</b> fill opacity
          <palette-item-controller :min="0" :max="1" :step="0.01"
            :model="model" prop="fillAlpha" />
        </div>
      </div>
      <hr />
    </palette-group>

    <!-- Simulation Behavior -->
    <palette-group persistent-controls open>
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

    <!-- Controller -->
    <palette-group persistent-controls open>
      <h2 slot="title">Controller</h2>
      <input-checkbox slot="controls" v-model="controllers.midi.enabled" />

      <!--
      <div class="palette-item">
        <div class="palette-item__label">
          <b>MIDI</b> interface
        </div>
      </div>
       -->

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ midiInputName }}
            <input-select v-model="controllers.midi.activeInput">
              <option v-for="item in midiAvailableInputs" :value="item.name">
                {{ item.name }}
              </option>
            </input-select>
          </b> active MIDI input
        </div>
      </div>

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ midiSignalName }}</b> current signal
        </div>
      </div>
      <hr />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@renderer/utils/number'

import InputColor from '@renderer/components/input/Color'
import InputSelect from '@renderer/components/input/Select'
import InputCheckbox from '@renderer/components/input/Checkbox'
import InputRange from '@renderer/components/input/Range'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteConstraintPreview from '@renderer/components/palette/ConstraintPreview'
import PaletteItemController from '@renderer/components/palette/ItemController'
import PaletteStylePreview from '@renderer/components/palette/StylePreview'

export default {
  name: 'palette-tool',

  components: {
    InputColor,
    InputSelect,
    InputRange,
    InputCheckbox,
    PaletteGroup,
    PaletteConstraintPreview,
    PaletteItemController,
    PaletteStylePreview
  },

  props: {
    model: Object,
    styles: Array,
    constraints: Array,
    inputModTypes: Array,
    controllers: Object
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

    fillAlphaName () {
      const { fillAlpha } = this.model
      return `${roundToPlaces(fillAlpha * 100, 0)}%`
    },

    strokeStyleName () {
      const style = this.styles[this.model.styleIndex]
      return style.name
    },

    strokeConstraintName () {
      const type = this.constraints[this.model.constraintIndex]
      return type.name
    },

    depthName () {
      const { depth } = this.model
      return `${roundToPlaces(depth, 1)}pt`
    },

    midiInputName () {
      const { activeInput } = this.controllers.midi
      return activeInput || 'None'
    },

    midiAvailableInputs () {
      const { availableInputs } = this.controllers.midi
      return [
        { name: 'None' },
        ...availableInputs
      ]
    },

    midiSignalName () {
      const { currentSignal } = this.controllers.midi
      return !currentSignal.cc ? 'None'
        : `CC ${currentSignal.cc} :
          ${(currentSignal.value / 127).toFixed(2)}
          [${currentSignal.value}]`
    }
  }
}
</script>
