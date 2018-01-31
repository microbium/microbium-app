<template>
  <div class="palette-style-list">
    <palette-group v-for="(style, index) in list"
      :key="style.index" nested :open="index === 0">
      <h2 slot="title">
        {{ style.name }}
        <input-text v-model="style.name" />
      </h2>
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
    PaletteStyle
  }
}
</script>
