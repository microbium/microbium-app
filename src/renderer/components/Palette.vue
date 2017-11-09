<template>
  <div class="palette">
    <div class="palette-toolbar">
      <div @click="close" class="palette-close"></div>
    </div>

    <palette-group open>
      <h2 slot="title">Line Tool</h2>
      <palette-tool :model="lineTool" :styles="styles"></palette-tool>
    </palette-group>

    <palette-group open>
      <h2 slot="title">Styles</h2>
      <palette-group v-for="style in styles"
        :key="style.index" nested :open="style.index == 0">
        <h2 slot="title">{{ style.name }}</h2>
        <palette-style :model="style"></palette-style>
      </palette-group>
    </palette-group>

    <palette-group>
      <h2 slot="title">Geometry Modifiers</h2>
      <palette-modifiers :model="modifiers"></palette-modifiers>
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
import { createControlsState } from '@/store/modules/Palette'

import PaletteGroup from '@/components/palette/Group'
import PaletteStyle from '@/components/palette/Style'
import PaletteTool from '@/components/palette/Tool'
import PaletteModifiers from '@/components/palette/Modifiers'

export default {
  name: 'palette',

  components: {
    PaletteGroup,
    PaletteStyle,
    PaletteTool,
    PaletteModifiers
  },

  data () {
    return createControlsState()
  },

  methods: {
    syncControls (group, value) {
      this.$electron.ipcRenderer.send('main-message', {
        type: 'UPDATE_CONTROLS',
        group,
        value
      })
    },

    close () {
      this.$electron.ipcRenderer.send('toggle-window', {
        key: 'palette'
      })
    }
  },

  watch: {
    lineTool: createStateSyncer('lineTool'),
    styles: createStateSyncer('styles'),
    modifiers: createStateSyncer('modifiers')
  }
}

function createStateSyncer (name) {
  return {
    deep: true,
    handler (value) {
      this.syncControls(name, value)
    }
  }
}
</script>
