<template>
  <div class="palette-style-list">
    <palette-group v-for="(style, index) in list"
      :key="style.index" nested :open="index === 0">
      <h2 slot="title">
        {{ style.name }}
        <input-text v-model="style.name" />
      </h2>
      <div slot="controls">
        <palette-style-preview :model="style"
          :width="100" :height="22" :segments="6" />
      </div>
      <palette-style :model="style"
        :textures="textures"
        :alphaTextures="alphaTextures"
        :alphaFunctions="alphaFunctions" />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import InputText from '@/components/input/Text'
import PaletteGroup from '@/components/palette/Group'
import PaletteStyle from '@/components/palette/Style'
import PaletteStylePreview from '@/components/palette/StylePreview'

export default {
  name: 'palette-style-list',

  props: {
    list: Array,
    textures: Array,
    alphaTextures: Array,
    alphaFunctions: Array
  },

  components: {
    InputText,
    PaletteGroup,
    PaletteStyle,
    PaletteStylePreview
  }
}
</script>
