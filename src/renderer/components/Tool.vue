<template>
  <div id="tool">
    <div id="tool-toolbar"></div>
  </div>
</template>

<script>
  export default {
    name: 'tool',
    components: {},
    methods: {
    }
  }
</script>

<style>
  #tool {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: #222222;
    font: 11px/1 Helvetica, sans-serif;
    color: #444;
  }

  #tool-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    background-color: transparent;
    width: 100%;
    height: 30px;
    -webkit-app-region: drag;
  }
</style>
