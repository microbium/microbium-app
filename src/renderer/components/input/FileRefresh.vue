<template>
  <label class="input-file-refresh"
    :class="baseClassNames"
    @click="refresh" v-on:dblclick="reset">
    <span class="input-file-refresh__ticker" :style="tickerStyle" />
  </label>
</template>

<style lang="scss">
.input-file-refresh {
  position: relative;
  display: block;

  margin: 8px;
  border-radius: 8px;
  border: 2px solid rgba(#fff, 0.3);
  width: 14px;
  height: 14px;

  opacity: 0.4;
  cursor: pointer;

  &.active {
    opacity: 1;
  }

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

  &__ticker {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;

    margin: -8px 0 0 -1px;
    border-top: 3px solid #fff;
    width: 2px;
    height: 16px;

    transform-origin: 50% 50%;
    transition: transform 150ms;
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
    },

    // TODO: Implement better UI to reset file
    reset () {
      this.$emit('input', null)
    }
  },

  computed: {
    baseClassNames () {
      return {
        active: !!this.value
      }
    },

    tickerStyle () {
      if (!this.value) return
      const { version } = this.value
      const angle = (version || 0) * Math.PI / 4

      return {
        transform: `rotate(${angle}rad)`
      }
    }
  }
}
</script>
