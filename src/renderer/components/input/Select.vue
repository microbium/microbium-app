<template>
  <label class="input-select">
    <select class="input-select__selector" v-model="actualValue">
      <slot></slot>
    </select>
  </label>
</template>

<style lang="scss">
.input-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
</style>

<script>
export default {
  name: 'input-select',
  props: {
    value: [String, Number]
  },

  data () {
    return {
      actualValue: null
    }
  },

  created () {
    this.actualValue = this.value
  },

  watch: {
    actualValue () {
      const value = this.actualValue
      this.$emit('input', value)
    }
  }
}
</script>
