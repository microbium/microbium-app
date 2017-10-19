<template>
  <div class="editor">
    <div class="editor-toolbar"></div>
    <editor-compositor></editor-compositor>
  </div>
</template>

<style>
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
