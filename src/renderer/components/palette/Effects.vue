<template>
  <div class="palette-effects">
    <palette-group persistent-controls open>
      <h2 slot="title">Bloom</h2>
      <input-checkbox slot="controls" v-model="model.bloom.enabled" />

      <div class="palette-item">
        <input-range min="0" max="3" step="0.05" v-model="model.bloom.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ bloomFactorName }}</b> intensity
          <palette-item-controller :min="0" :max="3"
            :model="model.bloom" prop="intensityFactor" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.bloom.feedbackOffset" />
        <div class="palette-item__label">
          <b>{{ bloomFeedbackOffsetName }}</b> feedback offset
          <palette-item-controller :min="-1" :max="1"
            :model="model.bloom" prop="feedbackOffset" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="0" max="6" step="1" v-model="model.bloom.blurPasses" />
        <div class="palette-item__label">
          <b>{{ bloomBlurPassesName }}</b> {{ bloomBlurPassesLabel }}
        </div>
      </div>
      <div class="palette-item">
        <input-range min="1" max="20" step="1" v-model="model.bloom.blurStep" />
        <div class="palette-item__label">
          <b>{{ bloomBlurStepName }}</b> blur radius interval
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0.1" max="1.5" step="0.05" v-model="model.bloom.bufferScale" />
        <div class="palette-item__label">
          <b>{{ bloomBufferScaleName }}</b> buffer resolution
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Gradient Banding</h2>
      <input-checkbox slot="controls" v-model="model.banding.enabled" />

      <div class="palette-item">
        <input-range min="0" max="3" step="0.05" v-model="model.banding.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ bandingFactorName }}</b> intensity
          <palette-item-controller :min="0" :max="3"
            :model="model.banding" prop="intensityFactor" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="4" max="256" step="2" v-model="model.banding.bandStep" />
        <div class="palette-item__label">
          <b>{{ bandingStepName }}</b> banding interval
          <palette-item-controller :min="4" :max="256"
            :model="model.bloom" prop="bandStep" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0.1" max="1.5" step="0.05" v-model="model.banding.bufferScale" />
        <div class="palette-item__label">
          <b>{{ bandingBufferScaleName }}</b> buffer resolution
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Shape Outlines</h2>
      <input-checkbox slot="controls" v-model="model.edges.enabled" />

      <div class="palette-item">
        <input-range min="0" max="5" step="0.05" v-model="model.edges.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ edgesFactorName }}</b> intensity
          <palette-item-controller :min="0" :max="5"
            :model="model.edges" prop="intensityFactor" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="0.1" max="5.0" step="0.1" v-model="model.edges.thickness" />
        <div class="palette-item__label">
          <b>{{ edgesThicknessName }}</b> thickness
          <palette-item-controller :min="0.1" :max="5"
            :model="model.edges" prop="thickness" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0.1" max="1.5" step="0.05" v-model="model.edges.bufferScale" />
        <div class="palette-item__label">
          <b>{{ edgesBufferScaleName }}</b> buffer resolution
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Color Shift</h2>
      <input-checkbox slot="controls" v-model="model.colorShift.enabled" />

      <div class="palette-item">
        <input-range min="-0.5" max="0.5" step="0.005" v-model="model.colorShift.hsl[0]" />
        <div class="palette-item__label">
          <b>{{ colorShiftHueName }}</b> hue
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift.hsl[1]" />
        <div class="palette-item__label">
          <b>{{ colorShiftSatName }}</b> saturation
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift.hsl[2]" />
        <div class="palette-item__label">
          <b>{{ colorShiftValName }}</b> value
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Noise</h2>
      <input-checkbox slot="controls" v-model="model.noise.enabled" />

      <div class="palette-item">
        <input-range min="0" max="5" step="0.05" v-model="model.noise.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ noiseFactorName }}</b> intensity
          <palette-item-controller :min="0" :max="5"
            :model="model.noise" prop="intensityFactor" />
        </div>
      </div>
      <hr />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import {
  roundToPlaces,
  numberToWords
} from '@renderer/utils/number'
import { pluralize } from '@renderer/utils/word'

import InputCheckbox from '@renderer/components/input/Checkbox'
import InputRange from '@renderer/components/input/Range'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteItemController from '@renderer/components/palette/ItemController'

export default {
  name: 'palette-effects',

  components: {
    InputCheckbox,
    InputRange,
    PaletteGroup,
    PaletteItemController
  },

  props: {
    model: Object
  },

  computed: {
    // Noise

    noiseFactorName () {
      const { noise } = this.model
      return `${roundToPlaces(noise.intensityFactor, 2)}x`
    },

    // Bloom

    bloomFactorName () {
      const { bloom } = this.model
      return `${roundToPlaces(bloom.intensityFactor, 2)}x`
    },

    bloomFeedbackOffsetName () {
      const { bloom } = this.model
      return `${roundToPlaces(bloom.feedbackOffset, 2)}x`
    },

    bloomBlurPassesName () {
      const { bloom } = this.model
      return numberToWords(bloom.blurPasses)
    },

    bloomBlurPassesLabel () {
      const { bloom } = this.model
      return `blur ${pluralize(bloom.blurPasses, 'pass', 'passes')}`
    },

    bloomBlurStepName () {
      const { bloom } = this.model
      return `${bloom.blurStep}px`
    },

    bloomBufferScaleName () {
      const { bloom } = this.model
      return `${roundToPlaces(bloom.bufferScale, 2)}x`
    },

    // Banding

    bandingFactorName () {
      const { banding } = this.model
      return `${roundToPlaces(banding.intensityFactor, 2)}x`
    },

    bandingStepName () {
      const { banding } = this.model
      return `${banding.bandStep}n`
    },

    bandingBufferScaleName () {
      const { banding } = this.model
      return `${roundToPlaces(banding.bufferScale, 2)}x`
    },

    // Edges

    edgesFactorName () {
      const { edges } = this.model
      return `${roundToPlaces(edges.intensityFactor, 2)}x`
    },

    edgesThicknessName () {
      const { edges } = this.model
      return `${roundToPlaces(edges.thickness, 2)}px`
    },

    edgesBufferScaleName () {
      const { edges } = this.model
      return `${roundToPlaces(edges.bufferScale, 2)}x`
    },

    // Color Shift

    colorShiftHueName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift.hsl[0] * 360, 1)}°`
    },

    colorShiftSatName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift.hsl[1] * 100, 1)}%`
    },

    colorShiftValName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift.hsl[2] * 100, 1)}%`
    }
  }
}
</script>
