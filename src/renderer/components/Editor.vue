<template>
  <div id="editor">
    <div id="editor-toolbar"></div>
  </div>
</template>

<script>
  export default {
    name: 'editor',
    components: {},
    methods: {
    }
  }
</script>

<style>
  #editor {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: #B2C9CF;
    font: 11px/1 Helvetica, sans-serif;
    color: #444;
  }

  #editor-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    background-color: transparent;
    width: 100%;
    height: 40px;
    -webkit-app-region: drag;
  }
</style>
