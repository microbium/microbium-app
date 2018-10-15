<template>
  <div class="palette-force-list">
    <palette-group v-for="(force, index) in list"
      :key="force.index" persistent-controls :open="index === 0">
      <h2 slot="title" :title="force.name">
        <input-text v-model="force.name" :maxsize="18" />
        <span class="text-ellipsis">
          {{ force.name }}
        </span>
      </h2>

      <!-- FEAT: Create force preview component -->
      <input-button slot="controls"
        :disabled="index === 0 || index !== list.length - 1"
        :action="removeListItem.bind(null, force)">
        <icon name="minus" :size="12" />
      </input-button>
      <input-button slot="controls"
        :action="duplicateListItem.bind(null, force)">
        <icon name="plus" :size="12" />
      </input-button>

      <palette-force :model="force"
        :forceTypes="forceTypes"
        :forcePositionTypes="forcePositionTypes"
        :forceIntensityTypes="forceIntensityTypes" />
    </palette-group>
  </div>
</template>

<style lang="scss">
.palette-force-list {
  .text-ellipsis {
    max-width: 160px;
  }

  .input-text--focus + .text-ellipsis {
    opacity: 0;
  }
}
</style>

<script>
import Icon from '@src/components/display/Icon'
import InputButton from '@src/components/input/Button'
import InputText from '@src/components/input/Text'
import PaletteGroup from '@src/components/palette/Group'
import PaletteForce from '@src/components/palette/Force'
import EditableListMixin from '@src/mixins/EditableListMixin'

export default {
  name: 'palette-force-list',

  props: {
    list: Array,
    forceTypes: Array,
    forcePositionTypes: Array,
    forceIntensityTypes: Array
  },

  mixins: [EditableListMixin],

  components: {
    Icon,
    InputButton,
    InputText,
    PaletteGroup,
    PaletteForce
  }
}
</script>
