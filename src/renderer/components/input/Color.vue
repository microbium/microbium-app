<template>
  <label class="input-color">
    <input v-model="hexValue" type="color">
  </label>
</template>

<style lang="scss">
.input-color {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
</style>

<script>
// OPTIM: Native color picker seems to have perf issues ...
export default {
  name: 'input-color',
  props: {
    value: String
  },

  data () {
    return {
      hexValue: null
    }
  },

  created () {
    this.hexValue = this.value
  },

  watch: {
    hexValue () {
      const value = this.hexValue
      this.$emit('input', value.toUpperCase())
    }
  }
}
</script>
