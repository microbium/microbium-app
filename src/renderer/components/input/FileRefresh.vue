<template>
  <label class="input-file-refresh" @click="refresh" />
</template>

<style lang="scss">
.input-file-refresh {
  position: relative;
  display: block;

  margin: 8px 0;
  border-radius: 8px;
  border: 2px solid rgba(#fff, 0.3);
  width: 14px;
  height: 14px;

  opacity: 0.4;
  cursor: pointer;

  &:after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;

    display: block;
    border-radius: 3px;
    border: 1px solid #fff;
    width: 4px;
    height: 4px;
  }
}
</style>

<script>
export default {
  name: 'input-file-refresh',

  props: {
    value: Object
  },

  methods: {
    refresh () {
      if (!this.value) return
      this.value.version++
    }
  }
}
</script>
