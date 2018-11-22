<template>
  <div class="palette-style">
    <!-- Stroke pattern -->
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ lineAlphaFunctionName }}
          <input-select v-model="model.lineAlphaFuncIndex">
            <option v-for="alphaFunc in lineAlphaFunctions" :value="alphaFunc.index">
              {{ alphaFunc.name }}
            </option>
          </input-select>
        </b> stroke pattern
      </div>
    </div>

    <!-- Stroke width -->
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

    <!-- Fill pattern -->
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ fillAlphaFunctionName }}
          <input-select v-model="model.fillAlphaFuncIndex">
            <option v-for="alphaFunc in fillAlphaFunctions" :value="alphaFunc.index">
              {{ alphaFunc.name }}
            </option>
          </input-select>
        </b> fill pattern
      </div>
    </div>
    <hr />

    <!-- Color -->
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ model.tintHex.toUpperCase() }}
          <input-color v-model="model.tintHex" />
        </b> tint
      </div>
    </div>
    <div class="palette-item">
      <input-range min="0" max="1" step="0.01" v-model="model.tintAlpha" />
      <div class="palette-item__label">
        <b>{{ tintAlphaName }}</b> opacity
        <palette-item-controller :min="0" :max="1"
          :model="model" prop="tintAlpha" />
      </div>
    </div>
    <hr />

    <!-- FEAT: Add support for user-defined textures, improve alpha / tint mapping
     -->
    <!--
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ textureName }}
          <input-select v-model="model.textureIndex">
            <option v-for="texture in textures" :value="texture.index">
              {{ texture.name }}
            </option>
          </input-select>
        </b> tint texture
      </div>
    </div>

    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ alphaTextureName }}
          <input-select v-model="model.alphaTextureIndex">
            <option v-for="texture in alphaTextures" :value="texture.index">
              {{ texture.name }}
            </option>
          </input-select>
        </b> alpha texture
      </div>
    </div>
    -->
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@renderer/utils/number'

import InputColor from '@renderer/components/input/Color'
import InputRange from '@renderer/components/input/Range'
import InputSelect from '@renderer/components/input/Select'
import PaletteItemController from '@renderer/components/palette/ItemController'

export default {
  name: 'palette-style',

  components: {
    InputColor,
    InputRange,
    InputSelect,
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

    fillAlphaFunctionName () {
      const alphaFunc = this.lineAlphaFunctions[this.model.fillAlphaFuncIndex]
      return alphaFunc.name
    },

    thicknessName () {
      const { thickness } = this.model
      return `${roundToPlaces(thickness, 1)}x`
    },

    strokeModName () {
      const { strokeWidthMod } = this.model
      return `${roundToPlaces(strokeWidthMod, 1)}x`
    },

    tintAlphaName () {
      const { tintAlpha } = this.model
      return `${roundToPlaces(tintAlpha * 100, 0)}%`
    },

    textureName () {
      const texture = this.textures[this.model.textureIndex]
      return texture.name
    },

    alphaTextureName () {
      const texture = this.alphaTextures[this.model.alphaTextureIndex]
      return texture.name
    }
  }
}
</script>
