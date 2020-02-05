<template>
  <div class="palette-style">
    <palette-group nested>
      <h2 slot="title">Stroke</h2>

      <div class="palette-item">
        <input-range min="0" max="5" step="0.1"
          v-model="model.thickness" />
        <div class="palette-item__label">
          <b>{{ thicknessName }}</b> stroke width factor
          <palette-item-controller :min="0" :max="5"
            :model="model" prop="thickness" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="5" step="0.1"
          v-model="model.strokeWidthMod" />
        <div class="palette-item__label">
          <b>{{ strokeModName }}</b>
          stroke modulation
          <palette-item-controller :min="0" :max="5"
            :model="model" prop="strokeWidthMod" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ model.lineTintHex.toUpperCase() }}
            <input-color v-model="model.lineTintHex" />
          </b> tint
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.lineTintAlpha" />
        <div class="palette-item__label">
          <b>{{ lineTintAlphaName }}</b> alpha factor
          <palette-item-controller :min="0" :max="1"
            :model="model" prop="lineTintAlpha" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ lineAlphaFunctionName }}
            <input-select v-model="model.lineAlphaFuncIndex">
              <option v-for="alphaFunc in lineAlphaFunctions" :value="alphaFunc.index">
                {{ alphaFunc.name }}
              </option>
            </input-select>
          </b> pattern base
        </div>
      </div>
      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ lineAlphaMapName }}
            <input-file accept=".png,.jpg" v-model="model.lineAlphaMapFile" />
          </b> pattern map
        </div>
        <div class="palette-item__controls">
          <input-file-refresh v-model="model.lineAlphaMapFile" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="20" max="120" step="1" v-model="model.lineAlphaMapRepeat" />
        <div class="palette-item__label">
          <b>{{ lineAlphaMapRepeatName }}</b> pattern map size
          <palette-item-controller :min="20" :max="120"
            :model="model" prop="lineAlphaMapRepeat" />
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group nested>
      <h2 slot="title">Fill</h2>

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ model.fillTintHex.toUpperCase() }}
            <input-color v-model="model.fillTintHex" />
          </b> tint
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="1" step="0.01" v-model="model.fillTintAlpha" />
        <div class="palette-item__label">
          <b>{{ fillTintAlphaName }}</b> alpha factor
          <palette-item-controller :min="0" :max="1"
            :model="model" prop="fillTintAlpha" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ fillAlphaFunctionName }}
            <input-select v-model="model.fillAlphaFuncIndex">
              <option v-for="alphaFunc in fillAlphaFunctions" :value="alphaFunc.index">
                {{ alphaFunc.name }}
              </option>
            </input-select>
          </b> pattern base
        </div>
      </div>
      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ fillAlphaMapName }}
            <input-file accept=".png,.jpg" v-model="model.fillAlphaMapFile" />
          </b> pattern map
        </div>
        <div class="palette-item__controls">
          <input-file-refresh v-model="model.fillAlphaMapFile" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="20" max="120" step="1" v-model="model.fillAlphaMapRepeat" />
        <div class="palette-item__label">
          <b>{{ fillAlphaMapRepeatName }}</b> pattern map size
          <palette-item-controller :min="20" :max="120"
            :model="model" prop="fillAlphaMapRepeat" />
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group nested>
      <h2 slot="title">Depth</h2>

      <div class="palette-item">
        <input-range min="-1000" max="1000" step="5"
          v-model="model.depthOffset" />
        <div class="palette-item__label">
          <b>{{ depthOffsetName }}</b> depth offset
          <palette-item-controller :min="-1000" :max="1000" :step="5"
            :model="model" prop="depthOffset" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="-10" max="10" step="0.1"
          v-model="model.depthScale" />
        <div class="palette-item__label">
          <b>{{ depthScaleName }}</b> depth scale
          <palette-item-controller :min="-10" :max="10"
            :model="model" prop="depthScale" />
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ depthMapName }}
            <input-file accept=".png,.jpg" v-model="model.depthMapFile" />
          </b> depth displacement map
        </div>
        <div class="palette-item__controls">
          <input-file-refresh v-model="model.depthMapFile" />
        </div>
      </div>
      <div class="palette-item">
        <input-range min="20" max="120" step="1" v-model="model.depthMapRepeat" />
        <div class="palette-item__label">
          <b>{{ depthMapRepeatName }}</b> depth map size
          <palette-item-controller :min="20" :max="120"
            :model="model" prop="depthMapRepeat" />
        </div>
      </div>
      <hr />
    </palette-group>

    <palette-group nested>
      <h2 slot="title">Curve Geometry</h2>

      <div class="palette-item">
        <input-range min="0" max="20" step="1" v-model="model.curveSegMinLength" />
        <div class="palette-item__label">
          <b>{{ curveSegMinLengthName }}</b> min length
        </div>
      </div>
      <div class="palette-item">
        <input-range min="2" max="16" step="1" v-model="model.curveSegMaxLength" />
        <div class="palette-item__label">
          <b>{{ curveSegMaxLengthName }}</b> max length
        </div>
      </div>
      <hr />

      <div class="palette-item">
        <input-range min="1" max="12" v-model="model.curveSubDivisions" />
        <div class="palette-item__label">
          <b>{{ curveSubDivisionsName }}</b> {{ curveSubDivisionsLabel }}
        </div>
      </div>
      <hr />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces, numberToWords } from '@renderer/utils/number'
import { pluralize } from '@renderer/utils/word'

import InputColor from '@renderer/components/input/Color'
import InputFile from '@renderer/components/input/File'
import InputFileRefresh from '@renderer/components/input/FileRefresh'
import InputRange from '@renderer/components/input/Range'
import InputSelect from '@renderer/components/input/Select'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteItemController from '@renderer/components/palette/ItemController'

export default {
  name: 'palette-style',

  components: {
    InputColor,
    InputFile,
    InputFileRefresh,
    InputRange,
    InputSelect,
    PaletteGroup,
    PaletteItemController
  },

  props: {
    model: Object,
    textures: Array,
    alphaTextures: Array,
    alphaFunctions: Object
  },

  computed: {
    lineAlphaFunctions () {
      const { alphaFunctions } = this
      return alphaFunctions.line.map((index) => alphaFunctions.all[index])
    },

    fillAlphaFunctions () {
      const { alphaFunctions } = this
      return alphaFunctions.fill.map((index) => alphaFunctions.all[index])
    },

    lineAlphaFunctionName () {
      const alphaFunc = this.lineAlphaFunctions[this.model.lineAlphaFuncIndex]
      return alphaFunc.name
    },

    lineAlphaMapName () {
      const { lineAlphaMapFile } = this.model
      if (!lineAlphaMapFile) return 'Empty'
      return lineAlphaMapFile.name
    },

    lineAlphaMapRepeatName () {
      const { lineAlphaMapRepeat } = this.model
      return `${roundToPlaces(lineAlphaMapRepeat, 0)}n`
    },

    fillAlphaFunctionName () {
      const alphaFunc = this.lineAlphaFunctions[this.model.fillAlphaFuncIndex]
      return alphaFunc.name
    },

    fillAlphaMapName () {
      const { fillAlphaMapFile } = this.model
      if (!fillAlphaMapFile) return 'Empty'
      return fillAlphaMapFile.name
    },

    fillAlphaMapRepeatName () {
      const { fillAlphaMapRepeat } = this.model
      return `${roundToPlaces(fillAlphaMapRepeat, 0)}n`
    },

    thicknessName () {
      const { thickness } = this.model
      return `${roundToPlaces(thickness, 1)}x`
    },

    depthOffsetName () {
      const { depthOffset } = this.model
      return `${roundToPlaces(depthOffset, 1)}pt`
    },

    depthScaleName () {
      const { depthScale } = this.model
      return `${roundToPlaces(depthScale, 1)}x`
    },

    depthMapName () {
      const { depthMapFile } = this.model
      if (!depthMapFile) return 'Empty'
      return depthMapFile.name
    },

    depthMapRepeatName () {
      const { depthMapRepeat } = this.model
      return `${roundToPlaces(depthMapRepeat, 0)}n`
    },

    strokeModName () {
      const { strokeWidthMod } = this.model
      return `${roundToPlaces(strokeWidthMod, 1)}x`
    },

    lineTintAlphaName () {
      const { lineTintAlpha } = this.model
      return `${roundToPlaces(lineTintAlpha * 100, 0)}%`
    },

    fillTintAlphaName () {
      const { fillTintAlpha } = this.model
      return `${roundToPlaces(fillTintAlpha * 100, 0)}%`
    },

    textureName () {
      const texture = this.textures[this.model.textureIndex]
      return texture.name
    },

    alphaTextureName () {
      const texture = this.alphaTextures[this.model.alphaTextureIndex]
      return texture.name
    },

    curveSegMinLengthName () {
      const { curveSegMinLength } = this.model
      return `${roundToPlaces(curveSegMinLength, 0)}pt`
    },

    curveSegMaxLengthName () {
      const { curveSegMaxLength } = this.model
      return `${roundToPlaces(curveSegMaxLength * 10, 0)}pt`
    },

    curveSubDivisionsName () {
      const { curveSubDivisions } = this.model
      return numberToWords(curveSubDivisions)
    },

    curveSubDivisionsLabel () {
      const { curveSubDivisions } = this.model
      return `segment ${pluralize(curveSubDivisions, 'subdivision', 'subdivisions')}`
    }
  }
}
</script>
