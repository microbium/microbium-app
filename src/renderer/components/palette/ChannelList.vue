<template>
  <div class="palette-channel-list">
    <palette-group v-for="(item, index) in list"
      :key="item.index" persistent-controls :open="index === 0">
      <h2 slot="title" :title="`CC [${item.channel}]`">
        <span class="text-ellipsis">
          CC [{{ item.channel }}]
        </span>
      </h2>

      <input-button slot="controls"
        :disabled="index === 0 || index !== list.length - 1"
        :action="removeListItem.bind(null, item)">
        <icon name="minus" :size="12" />
      </input-button>
      <input-button slot="controls"
        :action="duplicateListItem.bind(null, item)">
        <icon name="plus" :size="12" />
      </input-button>

      <palette-channel :model="item" />
    </palette-group>
  </div>
</template>

<style lang="scss">
.palette-channel-list {
}
</style>

<script>
import Icon from '@renderer/components/display/Icon'
import InputButton from '@renderer/components/input/Button'
import InputText from '@renderer/components/input/Text'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteChannel from '@renderer/components/palette/Channel'
import EditableListMixin from '@renderer/mixins/EditableListMixin'

export default {
  name: 'palette-channel-list',

  props: {
    list: Array
  },

  mixins: [EditableListMixin],

  components: {
    Icon,
    InputButton,
    InputText,
    PaletteGroup,
    PaletteChannel
  },

  methods: {
    willDuplicateListItem (dup, index) {
      dup.channel = index
    }
  }
}
</script>
