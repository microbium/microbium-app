<template>
  <label class="input-file">
    <input class="input-file__selector" type="file"
      :accept="accept"
      @change="processFile($event)" />
  </label>
</template>

<style lang="scss">
.input-file {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;

  > input {
    position: relative;
    width: auto;
    height: 100%;
  }
}
</style>

<script>
export default {
  name: 'input-file',

  props: {
    value: Object,
    accept: String
  },

  data () {
    return {
      actualValue: null
    }
  },

  created () {
    this.actualValue = this.value
  },

  methods: {
    processFile (event) {
      const file = event.target.files[0]
      if (file == null) return this.$emit('input', null)

      const { name, path, type } = file
      const version = 0
      this.$emit('input', { name, path, type, version })
    }
  },

  watch: {
    value () {
      this.actualValue = this.value
    }
  }
}
</script>
