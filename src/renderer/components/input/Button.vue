<template>
  <button class="input-button"
    :class="{ 'disabled': disabled }" @click="triggerAction">
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
  font-weight: 300;
  line-height: 1;

  --webkit-appearance: none;

  path {
    fill: #fff;
  }

  &.disabled {
    opacity: 0.1;
  }
}
</style>

<script>
export default {
  name: 'input-button',

  props: {
    action: Function,
    disabled: Boolean
  },

  methods: {
    triggerAction (event) {
      if (!this.disabled && this.action) {
        this.action.call(null, event)
      }
    }
  }
}
</script>
