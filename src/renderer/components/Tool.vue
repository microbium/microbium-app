<template>
  <div id="tool">
    <div id="tool-toolbar">
      <div v-on:click="close" id="tool-close"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'tool',
    components: {},

    data () {
      return {}
    },

    methods: {
      close () {
        this.$electron.remote.getCurrentWindow().close()
      }
    }
  }
</script>

<style>
  #tool {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: transparent;
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

  #tool-close {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #fff;
    width: 13px;
    height: 13px;
    border: 1px solid #444;
    border-radius: 50%;
  }
  #tool-close:hover {
    background: #f00;
  }
</style>
