<!-- TODO: Add per-group checkbox to allow quickly toggling enabled state -->
<template>
  <div class="palette-effects">
    <palette-group nested open>
      <h2 slot="title">Resolution</h2>

      <div class="palette-item">
        <!-- TODO: Move viewport / background controls to separate section -->
        <!-- TODO: Add separate export resolution / pixel ratio setting -->
        <input-range min="0.25" max="5" step="0.25" v-model="viewport.pixelRatio" />
        <div class="palette-item__label">
          <b>{{ pixelRatioName }}</b> pixel density
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group nested open>
      <h2 slot="title">Background</h2>

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ model.clear.colorHex.toUpperCase() }}
            <input-color v-model="model.clear.colorHex" />
          </b> color
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="2" step="0.05" v-model="model.clear.alphaFactor" />
        <div class="palette-item__label">
          <b>{{ clearAlphaName }}</b> fade out
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group nested open>
      <h2 slot="title">Bloom</h2>

      <div class="palette-item">
        <input-range min="0" max="3" step="0.05" v-model="model.bloom.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ bloomFactorName }}</b> intensity
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

    <palette-group nested>
      <h2 slot="title">Gradient Banding</h2>

      <div class="palette-item">
        <input-range min="0" max="3" step="0.05" v-model="model.banding.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ bandingFactorName }}</b> intensity
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="4" max="64" step="2" v-model="model.banding.bandStep" />
        <div class="palette-item__label">
          <b>{{ bandingStepName }}</b> banding interval
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

    <palette-group nested>
      <h2 slot="title">Shape Outlines</h2>

      <div class="palette-item">
        <input-range min="0" max="3" step="0.05" v-model="model.edges.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ edgesFactorName }}</b> intensity
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="0.1" max="5.0" step="0.1" v-model="model.edges.thickness" />
        <div class="palette-item__label">
          <b>{{ edgesThicknessName }}</b> thickness
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

    <palette-group nested>
      <h2 slot="title">Color Shift</h2>

      <div class="palette-item">
        <input-range min="-0.5" max="0.5" step="0.005" v-model="model.colorShift[0]" />
        <div class="palette-item__label">
          <b>{{ colorShiftHueName }}</b> hue
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift[1]" />
        <div class="palette-item__label">
          <b>{{ colorShiftSatName }}</b> saturation
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift[2]" />
        <div class="palette-item__label">
          <b>{{ colorShiftValName }}</b> value
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group nested>
      <h2 slot="title">Noise</h2>

      <div class="palette-item">
        <input-range min="0" max="5" step="0.05" v-model="model.noise.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ noiseFactorName }}</b> intensity
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
} from '@src/utils/number'
import { pluralize } from '@src/utils/word'

import InputColor from '@src/components/input/Color'
import InputRange from '@src/components/input/Range'
import PaletteGroup from '@src/components/palette/Group'

export default {
  name: 'palette-effects',

  components: {
    InputColor,
    InputRange,
    PaletteGroup
  },

  props: {
    model: Object,
    viewport: Object
  },

  computed: {
    // Resolution
    pixelRatioName () {
      const { pixelRatio } = this.viewport
      return `${roundToPlaces(pixelRatio, 2)}x`
    },

    // Background

    clearAlphaName () {
      const { clear } = this.model
      return `${roundToPlaces(clear.alphaFactor, 2)}x`
    },

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
      return `${roundToPlaces(colorShift[0] * 360, 1)}°`
    },

    colorShiftSatName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift[1] * 100, 1)}%`
    },

    colorShiftValName () {
      const { colorShift } = this.model
      return `${roundToPlaces(colorShift[2] * 100, 1)}%`
    }
  }
}
</script>
