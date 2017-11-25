<template>
  <label class="input-text">
    <input type="text" v-bind:size="((textValue.length || 1) * 1.2 + 3)"
      ref="input" v-model="textValue" @keyup.enter="submit" />
  </label>
</template>

<style lang="scss">
.input-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  > input {
    position: absolute;
    top: -5px;
    left: -6px;
    display: inline-block;
    outline: none;

    background: rgba(#222, 0.25);
    border: 2px solid rgba(#000, 0.25);
    border-radius: 2px;
    padding: 2px 4px;
    width: auto;
    opacity: 0;

    color: inherit;
    font: inherit;
    text-align: inherit;
    text-indent: inherit;
    letter-spacing: inherit;
    word-spacing: inherit;

    &:focus {
      opacity: 1
    }
  }
}
</style>

<script>
export default {
  name: 'input-text',
  props: {
    value: String
  },

  data () {
    return {
      textValue: null
    }
  },

  created () {
    this.textValue = this.value
  },

  methods: {
    submit () {
      this.$refs.input.blur()
    }
  },

  watch: {
    textValue () {
      const value = this.textValue.trim() || '-'
      this.$emit('input', value)
    }
  }
}
</script>
