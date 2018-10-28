<template>
  <div class="palette-constraint-list">
    <palette-group v-for="(constraint, index) in list"
      :key="constraint.index" persistent-controls :open="index === 0">
      <h2 slot="title" :title="constraint.name">
        <input-text v-model="constraint.name" :maxsize="18" />
        <span class="text-ellipsis">
          {{ constraint.name }}
        </span>
      </h2>

      <palette-constraint-preview slot="controls"
        :model="constraint" :width="80" :height="22" />
      <input-button slot="controls"
        :disabled="index === 0 || index !== list.length - 1"
        :action="removeListItem.bind(null, constraint)">
        <icon name="minus" :size="12" />
      </input-button>
      <input-button slot="controls"
        :action="duplicateListItem.bind(null, constraint)">
        <icon name="plus" :size="12" />
      </input-button>

      <palette-constraint :model="constraint"
        :constraintTypes="constraintTypes" />
    </palette-group>
  </div>
</template>

<style lang="scss">
.palette-constraint-list {
  .text-ellipsis {
    max-width: 160px;
  }

  .input-text--focus + .text-ellipsis {
    opacity: 0;
  }
}
</style>

<script>
import Icon from '@renderer/components/display/Icon'
import InputButton from '@renderer/components/input/Button'
import InputText from '@renderer/components/input/Text'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteConstraint from '@renderer/components/palette/Constraint'
import PaletteConstraintPreview from '@renderer/components/palette/ConstraintPreview'
import EditableListMixin from '@renderer/mixins/EditableListMixin'

export default {
  name: 'palette-constraint-list',

  props: {
    list: Array,
    constraintTypes: Array
  },

  mixins: [EditableListMixin],

  components: {
    Icon,
    InputButton,
    InputText,
    PaletteGroup,
    PaletteConstraint,
    PaletteConstraintPreview
  }
}
</script>
