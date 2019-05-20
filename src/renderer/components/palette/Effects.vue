<template>
  <div class="palette-effects">
    <palette-group persistent-controls>
      <h2 slot="title">Polar Generator</h2>
      <input-checkbox slot="controls" v-model="model.polar.enabled" />

      <div class="palette-item">
        <input-range min="1" max="11" step="1" v-model="model.polar.iterations" />
        <div class="palette-item__label">
          <b>{{ polarIterationsName }}</b> {{ polarIterationsLabel }}
          <palette-item-controller :min="1" :max="11" :step="1"
            :model="model.polar" prop="iterations" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="0" max="1" step="0.05" v-model="model.polar.mirrorIntensityFactor" />
        <div class="palette-item__label">
          <b>{{ mirrorFactorName }}</b> mirror intensity
          <palette-item-controller :min="0" :max="1"
            :model="model.polar" prop="mirrorIntensityFactor" />
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
        <input-range min="0.05" max="2" step="0.05" v-model="model.banding.bufferScale" />
        <div class="palette-item__label">
          <b>{{ bandingBufferScaleName }}</b> buffer resolution
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Gradient Contours</h2>
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
        <input-range min="1" max="128" step="1" v-model="model.edges.repeat" />
        <div class="palette-item__label">
          <b>{{ edgesRepeatName }}</b> contour interval
          <palette-item-controller :min="1" :max="128"
            :model="model.edges" prop="repeat" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0.05" max="2" step="0.05" v-model="model.edges.bufferScale" />
        <div class="palette-item__label">
          <b>{{ edgesBufferScaleName }}</b> buffer resolution
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Color Transform</h2>
      <input-checkbox slot="controls" v-model="model.lut.enabled" />

      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.lut.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ lutFactorName }}</b> intensity
          <palette-item-controller :min="0" :max="1"
            :model="model.lut" prop="intensityFactor" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ lutFileName }}
            <input-file accept=".png,.jpg" v-model="model.lut.textureFile" />
          </b> texture (LUT)
        </div>
        <div class="palette-item__controls">
          <input-file-refresh v-model="model.lut.textureFile" />
        </div>
      </div>
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Color Shift</h2>
      <input-checkbox slot="controls" v-model="model.colorShift.enabled" />

      <div class="palette-item">
        <input-range min="-0.5" max="0.5" step="0.005" v-model="model.colorShift.hsl[0]" />
        <div class="palette-item__label">
          <b>{{ colorShiftHueName }}</b> hue
          <palette-item-controller :min="-0.5" :max="0.5"
            :model="model.colorShift.hsl" prop="0" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift.hsl[1]" />
        <div class="palette-item__label">
          <b>{{ colorShiftSatName }}</b> saturation
          <palette-item-controller :min="-1" :max="1"
            :model="model.colorShift.hsl" prop="1" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-1" max="1" step="0.01" v-model="model.colorShift.hsl[2]" />
        <div class="palette-item__label">
          <b>{{ colorShiftValName }}</b> value
          <palette-item-controller :min="-1" :max="1"
            :model="model.colorShift.hsl" prop="2" />
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
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
      <div class="palette-item">
        <input-range min="-10" max="10" step="0.1" v-model="model.bloom.feedbackPolarOffset" />
        <div class="palette-item__label">
          <b>{{ bloomFeedbackPolarOffsetName }}</b> polar offset
          <palette-item-controller :min="-10" :max="10" :step="0.1"
            :model="model.bloom" prop="feedbackPolarOffset" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-180" max="180" step="0.5" v-model="model.bloom.feedbackPolarAngle" />
        <div class="palette-item__label">
          <b>{{ bloomFeedbackPolarAngleName }}</b> polar angle
          <palette-item-controller :min="-180" :max="180"
            :model="model.bloom" prop="feedbackPolarAngle" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="0" max="6" step="1" v-model="model.bloom.blurPasses" />
        <div class="palette-item__label">
          <b>{{ bloomBlurPassesName }}</b> {{ bloomBlurPassesLabel }}
          <palette-item-controller :min="0" :max="6" :step="1"
            :model="model.bloom" prop="blurPasses" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="1" max="20" step="0.5" v-model="model.bloom.blurStep" />
        <div class="palette-item__label">
          <b>{{ bloomBlurStepName }}</b> blur radius interval
          <palette-item-controller :min="1" :max="20" :step="0.5"
            :model="model.bloom" prop="blurStep" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0.05" max="2" step="0.05" v-model="model.bloom.bufferScale" />
        <div class="palette-item__label">
          <b>{{ bloomBufferScaleName }}</b> buffer resolution
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group persistent-controls>
      <h2 slot="title">Vignette</h2>
      <input-checkbox slot="controls" v-model="model.vignette.enabled" />

      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.vignette.intensityFactor" />
        <div class="palette-item__label">
          <b>{{ vignetteFactorName }}</b> intensity
          <palette-item-controller :min="0" :max="3"
            :model="model.vignette" prop="intensityFactor" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="1.0" step="0.01" v-model="model.vignette.radius" />
        <div class="palette-item__label">
          <b>{{ vignetteRadiusName }}</b> radius
          <palette-item-controller :min="0" :max="3"
            :model="model.vignette" prop="radius" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.vignette.smoothness" />
        <div class="palette-item__label">
          <b>{{ vignetteSmoothnessName }}</b> smoothness
          <palette-item-controller :min="0" :max="3"
            :model="model.vignette" prop="smoothness" />
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
import InputFile from '@renderer/components/input/File'
import InputFileRefresh from '@renderer/components/input/FileRefresh'
import InputRange from '@renderer/components/input/Range'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteItemController from '@renderer/components/palette/ItemController'

export default {
  name: 'palette-effects',

  components: {
    InputCheckbox,
    InputFile,
    InputFileRefresh,
    InputRange,
    PaletteGroup,
    PaletteItemController
  },

  props: {
    model: Object
  },

  computed: {
    // Polar

    polarIterationsName () {
      const { iterations } = this.model.polar
      return numberToWords(iterations)
    },

    polarIterationsLabel () {
      const { iterations } = this.model.polar
      return `polar ${pluralize(iterations, 'iteration', 'iterations')}`
    },

    mirrorFactorName () {
      const { mirrorIntensityFactor } = this.model.polar
      return `${roundToPlaces(mirrorIntensityFactor, 2)}x`
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

    bloomFeedbackOffsetName () {
      const { bloom } = this.model
      return `${roundToPlaces(bloom.feedbackOffset, 2)}x`
    },

    bloomFeedbackPolarAngleName () {
      const { feedbackPolarAngle } = this.model.bloom
      return `${roundToPlaces(feedbackPolarAngle, 1)}°`
    },

    bloomFeedbackPolarOffsetName () {
      const { feedbackPolarOffset } = this.model.bloom
      return `${Math.sign(feedbackPolarOffset) *
        roundToPlaces(feedbackPolarOffset * feedbackPolarOffset, 1)}pt`
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
      return `${roundToPlaces(bloom.blurStep, 1)}px`
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

    edgesRepeatName () {
      const { edges } = this.model
      return `${roundToPlaces(edges.repeat, 2)}n`
    },

    edgesBufferScaleName () {
      const { edges } = this.model
      return `${roundToPlaces(edges.bufferScale, 2)}x`
    },

    // LUT Transform

    lutFactorName () {
      const { lut } = this.model
      return `${roundToPlaces(lut.intensityFactor, 2)}x`
    },

    lutFileName () {
      const { textureFile } = this.model.lut
      if (!textureFile) return 'Empty'
      return textureFile.name
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
    },

    // Vignette

    vignetteFactorName () {
      const { vignette } = this.model
      return `${roundToPlaces(vignette.intensityFactor, 2)}x`
    },

    vignetteRadiusName () {
      const { vignette } = this.model
      return `${roundToPlaces(vignette.radius * 100, 0)}%`
    },

    vignetteSmoothnessName () {
      const { vignette } = this.model
      return `${roundToPlaces(vignette.smoothness * 100, 0)}%`
    }
  }
}
</script>
