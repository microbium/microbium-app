<template>
  <div class="editor-quick-tool">
    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ strokeStyleName }}
          <input-select v-model="model.styleIndex">
            <option v-for="style in styles" :value="style.index">
              {{ style.name }}
            </option>
          </input-select>
        </b> style
      </div>
    </div>

    <div class="palette-item">
      <div class="palette-item__label">
        <b>{{ strokeConstraintName }}
          <input-select v-model="model.constraintIndex">
            <option v-for="constraint in constraints" :value="constraint.index">
              {{ constraint.name }}
            </option>
          </input-select>
        </b> constraint
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.editor-quick-tool {
  display: flex;
}
</style>

<script>
import InputSelect from '@renderer/components/input/Select'

export default {
  name: 'editor-quick-tool',

  props: {
    model: Object,
    styles: Array,
    constraints: Array
  },

  components: {
    InputSelect
  },

  computed: {
    strokeStyleName () {
      const style = this.styles[this.model.styleIndex]
      return style.name
    },

    strokeConstraintName () {
      const type = this.constraints[this.model.constraintIndex]
      return type.name
    }
  }
}
</script>
