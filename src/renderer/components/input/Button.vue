<template>
  <button class="input-button" @click="action">
    <slot />
  </button>
</template>

<style lang="scss">
.input-button {
  position: relative;
  display: inline-block;
  margin: 0 2px;
  background: transparent;
  border: none;
  outline: none;

  color: #fff;
  font-size: 18px;
  font-weight: lighter;
  line-height: 1;

  --webkit-appearance: none;

  path {
    fill: #fff;
  }
}
</style>

<script>
export default {
  name: 'input-button',
  props: {
    action: Function
  }
}
</script>
