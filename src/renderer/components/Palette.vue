<template>
  <div class="palette">
    <div class="palette-toolbar">
      <div v-on:click="close" class="palette-close"></div>
    </div>
    <div class="palette-item"></div>
  </div>
</template>

<style lang="scss">
  .palette {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: transparent;
    font: 11px/1 Helvetica, sans-serif;
    color: #444;
  }

  .palette-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    background-color: transparent;
    width: 100%;
    height: 30px;
    -webkit-app-region: drag;
  }

  .palette-close {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #fff;
    width: 13px;
    height: 13px;
    border: 1px solid #444;
    border-radius: 50%;

    &:hover {
      background: #f00;
    }
  }
</style>

<script>
  export default {
    name: 'palette',
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
