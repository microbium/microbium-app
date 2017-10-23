<template>
  <div class="palette">
    <div class="palette-toolbar">
      <div v-on:click="close" class="palette-close"></div>
    </div>
    <div class="palette-items">
      <div class="palette-item">
        <input-range min="1" max="12" v-model="curveSubDivisions"></input-range>
        <div class="palette-item__value">{{ curveSubDivisions }}</div>
        <div class="palette-item__label">curve subdivisions</div>
      </div>
      <div class="palette-item">
        <input-range min="1" max="32" v-model="polarIterations"></input-range>
        <div class="palette-item__value">{{ polarIterations }}</div>
        <div class="palette-item__label">polar iterations</div>
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
  font-weight: lighter;
  letter-spacing: 0.75px;
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

  &__value {
    display: inline-block;
    padding: 6px 2px 6px 8px;
    font-weight: normal;
  }

  &__label {
    display: inline-block;
    padding: 6px 8px 6px 0;
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
      polarIterations: 8,
      curveSubDivisions: 6
    }
  },

  methods: {
    syncControls (key, value) {
      this.$electron.ipcRenderer.send('main-message', {
        type: 'UPDATE_CONTROLS',
        key,
        value
      })
    },

    close () {
      this.$electron.remote.getCurrentWindow().close()
    }
  },

  watch: {
    polarIterations (value) {
      this.syncControls('polarIterations', value)
    },

    curveSubDivisions (value) {
      this.syncControls('curveSubDivisions', value)
    }
  }
}
</script>
