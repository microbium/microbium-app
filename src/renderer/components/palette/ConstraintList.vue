<template>
  <div class="palette-constraint-list">
    <palette-group v-for="(constraint, index) in list"
      :key="constraint.index" nested open>
      <h2 slot="title">
        {{ constraint.name }}
        <input-text v-model="constraint.name" />
      </h2>
      <div slot="controls">
        <input-button
          v-if="index === list.length - 1"
          :action="removeConstraintGroup.bind(null, constraint)">
          <icon name="minus" :size="12" />
        </input-button>
        <input-button
          :action="duplicateConstraintGroup.bind(null, constraint)">
          <icon name="plus" :size="12" />
        </input-button>
      </div>
      <palette-constraint :model="constraint"
        :constraintTypes="constraintTypes" />
    </palette-group>
  </div>
</template>

<style lang="scss">
</style>

<script>
import Icon from '@/components/display/Icon'
import InputButton from '@/components/input/Button'
import InputText from '@/components/input/Text'
import PaletteGroup from '@/components/palette/Group'
import PaletteConstraint from '@/components/palette/Constraint'

export default {
  name: 'palette-constraint-list',

  props: {
    list: Array,
    constraintTypes: Array
  },

  components: {
    Icon,
    InputButton,
    InputText,
    PaletteGroup,
    PaletteConstraint
  },

  methods: {
    // TODO: Enable removing constraint group anywhere in list
    // TODO: Ensure segments don't depend on removed group
    removeConstraintGroup (constraintGroup) {
      const { list } = this
      const { index } = constraintGroup
      if (index !== list.length - 1) return
      list.splice(index, 1)
    },

    duplicateConstraintGroup (constraintGroup) {
      const { list } = this
      const { name } = constraintGroup
      const nameCount = list.reduce((accum, c) => {
        return accum + (c.name.indexOf(name) === 0 ? 1 : 0)
      }, 0)

      const duplicate = Object.assign({}, constraintGroup, {
        index: list.length,
        name: `${name} ${1 + nameCount}`
      })
      list.push(duplicate)
    }
  }
}
</script>
