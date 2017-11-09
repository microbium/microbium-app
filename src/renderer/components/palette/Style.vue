<template>
  <div class="palette-style">
    <div class="palette-item">
      <input-range min="0" max="5" step="0.1"
        v-model="model.thickness" />
      <div class="palette-item__label">
        <b>{{ thicknessName }}</b> stroke thickness factor
      </div>
    </div>
    <div class="palette-item">
      <input-range min="0" max="5" step="0.1"
        v-model="model.strokeWidthMod" />
      <div class="palette-item__label">
        <b>{{ strokeModName }}</b>
        stroke width modulation
      </div>
    </div>
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ model.tintHex }}
          <input-color v-model="model.tintHex" />
        </b> stroke tint
      </div>
    </div>
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ textureName }}
          <input-select v-model="model.textureIndex">
            <option v-for="texture in textures" :value="texture.index">
              {{ texture.name }}
            </option>
          </input-select>
        </b> color texture
      </div>
    </div>
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ alphaFunctionName }}
          <input-select v-model="model.alphaFuncIndex">
            <option v-for="alphaFunc in alphaFunctions" :value="alphaFunc.index">
              {{ alphaFunc.name }}
            </option>
          </input-select>
        </b> alpha function
      </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { roundToPlaces } from '@/utils/number'

import InputColor from '@/components/input/Color'
import InputRange from '@/components/input/Range'
import InputSelect from '@/components/input/Select'

export default {
  name: 'palette-style',

  components: {
    InputColor,
    InputRange,
    InputSelect
  },

  props: {
    model: Object,
    textures: Array,
    alphaFunctions: Array
  },

  computed: {
    thicknessName () {
      const { thickness } = this.model
      return `${roundToPlaces(thickness, 1)}x`
    },

    strokeModName () {
      const { strokeWidthMod } = this.model
      return `${roundToPlaces(strokeWidthMod, 1)}x`
    },

    textureName () {
      const texture = this.textures[this.model.textureIndex]
      return texture.name
    },

    alphaFunctionName () {
      const alphaFunc = this.alphaFunctions[this.model.alphaFuncIndex]
      return alphaFunc.name
    }
  }
}
</script>
