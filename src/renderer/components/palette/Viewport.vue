<template>
  <!-- TODO: Add UI to disable or lessen opacity of overlay elements
    (polar grid, concentric lines, force indicators) -->
  <div class="palette-viewport">
    <palette-group open>
      <h2 slot="title">Background</h2>

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ model.background.colorHex.toUpperCase() }}
            <input-color v-model="model.background.colorHex" />
          </b> color
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="2" step="0.05" v-model="model.background.alphaFactor" />
        <div class="palette-item__label">
          <b>{{ backgroundAlphaName }}</b> fade out
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group open>
      <h2 slot="title">Overlays</h2>

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ model.overlay.colorHighlightHex.toUpperCase() }}
            <input-color v-model="model.overlay.colorHighlightHex" />
          </b> highlight color
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="1" step="0.05" v-model="model.overlay.alphaFactor" />
        <div class="palette-item__label">
          <b>{{ overlayAlphaName }}</b> opacity
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group open>
      <h2 slot="title">Resolution</h2>

      <div class="palette-item">
        <!-- TODO: Add separate export resolution / pixel ratio setting -->
        <input-range min="0.25" max="10" step="0.25" v-model="model.pixelRatio" />
        <div class="palette-item__label">
          <b>{{ pixelRatioName }}</b> pixel density
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
import InputRange from '@src/components/input/Range'
import PaletteGroup from '@src/components/palette/Group'

export default {
  name: 'palette-viewport',

  components: {
    InputColor,
    InputRange,
    PaletteGroup
  },

  props: {
    model: Object
  },

  computed: {
    // Resolution
    pixelRatioName () {
      const { pixelRatio } = this.model
      return `${roundToPlaces(pixelRatio, 2)}x`
    },

    // Background

    backgroundAlphaName () {
      const { background } = this.model
      return `${roundToPlaces(background.alphaFactor, 2)}x`
    },

    // Overlay

    overlayAlphaName () {
      const { overlay } = this.model
      return `${roundToPlaces(overlay.alphaFactor * 100, 0)}%`
    }
  }
}
</script>
