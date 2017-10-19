<template>
  <div class="editor">
    <div class="editor-toolbar"></div>
    <editor-compositor></editor-compositor>
    <div class="editor-background"></div>
  </div>
</template>

<style lang="scss">
.editor {
  position: relative;
  padding: 100px;
  width: 100vw;
  height: 100vh;
  background-color: #B2C9CF;
  font: 11px/1 Helvetica, sans-serif;
  color: #444;
}

.editor-toolbar {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: transparent;
  width: 100%;
  height: 40px;
  -webkit-app-region: drag;
}

.editor-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background-image: url(../assets/images/background.png);
  background-repeat: repeat;
  background-position: 50% 50%;
  background-size: 200px 200px;
  opacity: 0.8;

  pointer-events: none;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: radial-gradient(circle farthest-corner at 50% 50%,
      transparent 76%,
      rgba(32, 37, 37, 0.16) 85%,
      rgba(58, 67, 68, 0.64) 100%);
  }
}
</style>

<script>
import EditorCompositor from './EditorCompositor'

export default {
  name: 'editor',
  components: {
    EditorCompositor
  },
  methods: {}
}
</script>
