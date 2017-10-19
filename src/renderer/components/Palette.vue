<template>
  <div class="palette">
    <div class="palette-toolbar">
      <div v-on:click="close" class="palette-close"></div>
    </div>
    <div class="palette-items">
      <div class="palette-item">
        <input-range min="1" max="32" v-model="polarIterations"></input-range>
        <div class="palette-item__label">{{ polarIterations }} polar iterations</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$toolbar-height: 36px;
$base-color: rgba(#000, 0.15);

.palette {
  position: relative;
  padding-top: $toolbar-height;
  width: 100vw;
  min-height: 100vh;
  background: transparent;
  font: 11px/1 Monaco, monospace;
  color: #444;
}

.palette-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  background-color: $base-color;
  width: 100%;
  height: $toolbar-height;
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

.palette-item {
  background: $base-color;
  padding: 10px 24px;
  color: #fff;

  &__label {
    padding: 6px;
  }

  &:hover {
    background: transparent;
  }
}
</style>

<script>
import InputRange from '@/components/InputRange'

export default {
  name: 'palette',

  components: {
    InputRange
  },

  // TODO: Design scene settings data format
  data () {
    return {
      polarIterations: 8
    }
  },

  methods: {
    close () {
      this.$electron.remote.getCurrentWindow().close()
    }
  },

  watch: {
    polarIterations (value) {
      this.syncPolarIterations(value)
    }
  },

  syncPolarIterations (value) {
    this.$electron.ipcRenderer.send('main-message', {
      type: 'UPDATE_CONTROLS',
      key: 'polarIterations',
      value
    })
  }
}
</script>
