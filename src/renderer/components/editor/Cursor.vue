<template>
  <div class="editor-cursor"
    :style="baseStyle">
  </div>
</template>

<style lang="scss">
.editor-cursor {
  position: absolute;
  top: 0;
  left: 0;

  background: transparent;
  margin: -10px 0 0 -10px;
  width: 20px;
  height: 20px;

  pointer-events: none;

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;

    box-sizing: border-box;
    border: 2px solid black;
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
}
</style>

<script>
export default {
  name: 'editor-cursor',

  props: {
    position: Object
  },

  computed: {
    baseStyle () {
      const { position } = this
      return {
        willChange: 'transform',
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }
    }
  }
}
</script>
