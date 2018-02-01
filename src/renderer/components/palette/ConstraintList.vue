<template>
  <div class="palette-constraint-list">
    <palette-group v-for="(constraint, index) in list"
      :key="constraint.index" nested open>
      <h2 slot="title" :title="constraint.name">
        <input-text v-model="constraint.name" :maxsize="18" />
        <span class="text-ellipsis">
          {{ constraint.name }}
        </span>
      </h2>

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
import Icon from '@/components/display/Icon'
import InputButton from '@/components/input/Button'
import InputText from '@/components/input/Text'
import PaletteGroup from '@/components/palette/Group'
import PaletteConstraint from '@/components/palette/Constraint'
import EditableListMixin from '@/mixins/EditableListMixin'

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
    PaletteConstraint
  }
}
</script>
