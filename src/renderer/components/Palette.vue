<template>
  <div class="palette">
    <div class="palette-toolbar">
      <div @click="close" class="palette-close"></div>
    </div>

    <palette-group open>
      <h2 slot="title">Line Tool Settings</h2>
      <div class="palette-item">
        <input-range min="0.25" max="18" step="0.25" v-model="lineTool.strokeWidth"></input-range>
        <div class="palette-item__label">
          <b>{{ strokeWidthName }}</b> line width
        </div>
      </div>
      <div class="palette-item">
        <div class="palette-item__label">
          <b>{{ strokeStyleName }}
            <input-select v-model="lineTool.styleIndex">
              <option v-for="style in styles" :value="style.index">
                {{ style.name }}
              </option>
            </input-select>
          </b> line style
        </div>
      </div>
    </palette-group>

    <palette-group open>
      <h2 slot="title">Styles</h2>
      <palette-group v-for="style in styles"
        :key="style.index" open nested>
        <h2 slot="title">{{ style.name }}</h2>
      </palette-group>
    </palette-group>

    <palette-group>
      <h2 slot="title">Geometry Modifiers</h2>
      <div class="palette-item">
        <input-range min="1" max="12" v-model="modifiers.curveSubDivisions"></input-range>
        <div class="palette-item__label">
          <b>{{ curveSubDivisionsName }}</b> curve subdivisions
        </div>
      </div>
      <div class="palette-item">
        <input-range min="1" max="32" v-model="modifiers.polarIterations"></input-range>
        <div class="palette-item__label">
          <b>{{ polarIterationsName }}</b> polar iterations
        </div>
      </div>
    </palette-group>
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

  h2 {
    font-size: 1em;
    font-weight: inherit;
  }
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
  padding: 6px 0;
  font-size: 13px;

  &:first-child {
    padding-top: 3px;
  }

  &__label {
    padding: 0 8px;

    > b {
      position: relative;
      display: inline-block;
      border-top: 2px solid #fff;
      padding-top: 6px;
      font-weight: normal;

      &:first-letter {
        text-transform: uppercase;
      }
    }
  }
}
</style>

<script>
import { numberToWords } from '@/utils/number'
import { createControlsState } from '@/store/modules/Palette'

import InputRange from '@/components/input/Range'
import InputSelect from '@/components/input/Select'
import PaletteGroup from '@/components/palette/Group'

export default {
  name: 'palette',

  components: {
    InputRange,
    InputSelect,
    PaletteGroup
  },

  data () {
    return createControlsState()
  },

  methods: {
    syncControls (group, key, value) {
      this.$electron.ipcRenderer.send('main-message', {
        type: 'UPDATE_CONTROLS',
        group,
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
    strokeWidthName () {
      const { strokeWidth } = this.lineTool
      return `${strokeWidth}px`
    },

    strokeStyleName () {
      const style = this.styles[this.lineTool.styleIndex]
      return style.name
    },

    curveSubDivisionsName () {
      const { curveSubDivisions } = this.modifiers
      return numberToWords(curveSubDivisions)
    },

    polarIterationsName () {
      const { polarIterations } = this.modifiers
      return numberToWords(polarIterations)
    }
  },

  watch: {
    'lineTool.strokeWidth' (value) {
      this.syncControls('lineTool', 'strokeWidth', value)
    },

    'lineTool.styleIndex' (value) {
      this.syncControls('lineTool', 'styleIndex', value)
    },

    'modifiers.polarIterations' (value) {
      this.syncControls('modifiers', 'polarIterations', value)
    },

    'modifiers.curveSubDivisions' (value) {
      this.syncControls('modifiers', 'curveSubDivisions', value)
    }
  }
}
</script>
