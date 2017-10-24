<template>
  <div class="palette">
    <div class="palette-toolbar">
      <div v-on:click="close" class="palette-close"></div>
    </div>
    <div class="palette-item-group">
      <h2>Line Tool Settings</h2>
      <div class="palette-item">
        <input-range min="0" max="4" v-model="lineWidthStep"></input-range>
        <div class="palette-item__label">
          <b>{{ lineWidthName }}</b> line width
        </div>
      </div>
      <div class="palette-item">
        <input-range min="0" max="1" v-model="lineStyleIndex"></input-range>
        <div class="palette-item__label">
          <b>{{ lineStyleName }}</b> line style
        </div>
      </div>
    </div>
    <div class="palette-item-group">
      <h2>Geometry Modifiers</h2>
      <div class="palette-item">
        <input-range min="1" max="12" v-model="curveSubDivisions"></input-range>
        <div class="palette-item__label">
          <b>{{ curveSubDivisions }}</b> curve subdivisions
        </div>
      </div>
      <div class="palette-item">
        <input-range min="1" max="32" v-model="polarIterations"></input-range>
        <div class="palette-item__label">
          <b>{{ polarIterations }}</b> polar iterations
        </div>
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
  color: #fafafa;
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

.palette-item-group {
  background: $base-color;
  padding: 10px 14px;

  > h2 {
    padding: 2px 7px 8px;
    font-size: 15px;
    font-weight: lighter;
  }

  &:hover {
    background: transparent;
  }
}

.palette-item {
  padding: 3px 0;
  font-size: 12px;

  &__label {
    padding: 1px 8px;

    > b {
      font-weight: normal;
    }
  }
}
</style>

<script>
import InputRange from '@/components/InputRange'

const LINE_WIDTH_NAMES = ['Ultra Thin', 'Thin', 'Regular', 'Thick', 'Fat']
const LINE_STYLE_NAMES = ['Watercolor', 'Radial Dash']

export default {
  name: 'palette',

  components: {
    InputRange
  },

  // TODO: Design scene settings data format
  data () {
    return {
      lineWidthStep: 2,
      lineStyleIndex: 0,
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
      this.$electron.ipcRenderer.send('toggle-window', {
        key: 'palette'
      })
    }
  },

  computed: {
    lineWidthName () {
      return LINE_WIDTH_NAMES[this.lineWidthStep]
    },

    lineStyleName () {
      return LINE_STYLE_NAMES[this.lineStyleIndex]
    }
  },

  watch: {
    lineWidthStep (value) {
      this.syncControls('lineWidthStep', value)
    },

    lineStyleIndex (value) {
      this.syncControls('lineStyleIndex', value)
    },

    polarIterations (value) {
      this.syncControls('polarIterations', value)
    },

    curveSubDivisions (value) {
      this.syncControls('curveSubDivisions', value)
    }
  }
}
</script>
