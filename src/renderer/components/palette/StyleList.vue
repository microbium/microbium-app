<template>
  <div class="palette-style-list">
    <palette-group v-for="(style, index) in list"
      :key="style.index" nested persistent-controls :open="index === 0">
      <h2 slot="title" :title="style.name">
        <input-text v-model="style.name" :maxsize="18" />
        <span class="text-ellipsis">
          {{ style.name }}
        </span>
      </h2>

      <palette-style-preview slot="controls"
        :model="style" :width="80" :height="22" :segments="4" />
      <input-button slot="controls"
        :disabled="index === 0 || index !== list.length - 1"
        :action="removeListItem.bind(null, style)">
        <icon name="minus" :size="12" />
      </input-button>
      <input-button slot="controls"
        :action="duplicateListItem.bind(null, style)">
        <icon name="plus" :size="12" />
      </input-button>

      <palette-style :model="style"
        :textures="textures"
        :alphaTextures="alphaTextures"
        :alphaFunctions="alphaFunctions" />
    </palette-group>
  </div>
</template>

<style lang="scss">
.palette-style-list {
  .text-ellipsis {
    max-width: 120px;
  }

  .input-text--focus + .text-ellipsis {
    opacity: 0;
  }
}
</style>

<script>
import Icon from '@/components/display/Icon'
import InputButton from '@/components/input/Button'
import InputText from '@/components/input/Text'
import PaletteGroup from '@/components/palette/Group'
import PaletteStyle from '@/components/palette/Style'
import PaletteStylePreview from '@/components/palette/StylePreview'
import EditableListMixin from '@/mixins/EditableListMixin'

export default {
  name: 'palette-style-list',

  props: {
    list: Array,
    textures: Array,
    alphaTextures: Array,
    alphaFunctions: Array
  },

  mixins: [EditableListMixin],

  components: {
    Icon,
    InputButton,
    InputText,
    PaletteGroup,
    PaletteStyle,
    PaletteStylePreview
  }
}
</script>
