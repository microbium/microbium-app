<template>
  <div class="palette">
    <div class="palette__toolbar">
      <div @click="close" class="palette__close"></div>
    </div>
    <div class="palette__content">
      <palette-group open>
        <h2 slot="title">Line Tool</h2>
        <palette-tool :model="lineTool"
          :styles="styles"
          :inputModTypes="inputModTypes"
          :physicsTypes="physicsTypes" />
      </palette-group>

      <palette-group open>
        <h2 slot="title">Style Layers</h2>
        <palette-group v-for="style in styles"
          :key="style.index" nested :open="style.index == 0">
          <h2 slot="title">
            {{ style.name }}
            <input-text v-model="style.name" />
          </h2>
          <palette-style :model="style"
            :textures="textures"
            :alphaTextures="alphaTextures"
            :alphaFunctions="alphaFunctions" />
        </palette-group>
      </palette-group>

      <palette-group>
        <h2 slot="title">Geometry Modifiers</h2>
        <palette-modifiers :model="modifiers" />
      </palette-group>
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
  cursor: default;

  h2 {
    position: relative;
    display: inline-block;
    font-size: 1em;
    font-weight: inherit;
  }

  &__toolbar {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: $base-color;
    width: 100%;
    height: $toolbar-height;
    -webkit-app-region: drag;
  }

  &__close {
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

  &__content {
    position: absolute;
    top: $toolbar-height;
    left: 0;
    overflow-y: scroll;
    width: 100%;
    height: calc(100% - #{$toolbar-height});
  }
}

.palette-item {
  padding: 6px 0;
  font-size: 13px;

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

  > .range-slider {
    position: relative;
    display: block;
    margin-top: -4px;
  }
}
</style>

<script>
import { createControlsState } from '@/store/modules/Palette'

import InputText from '@/components/input/Text'
import PaletteGroup from '@/components/palette/Group'
import PaletteStyle from '@/components/palette/Style'
import PaletteTool from '@/components/palette/Tool'
import PaletteModifiers from '@/components/palette/Modifiers'

export default {
  name: 'palette',

  components: {
    InputText,
    PaletteGroup,
    PaletteStyle,
    PaletteTool,
    PaletteModifiers
  },

  data () {
    return createControlsState()
  },

  created () {
    this.$electron.ipcRenderer.on('message', this.handleMessage.bind(this))
  },

  methods: {
    handleMessage (event, data) {
      switch (data.type) {
        case 'UPDATE_STATE':
          if (data.key) this[data.group][data.key] = data.value
          else if (data.group) Object.assign(this[data.group], data.value)
          else Object.assign(this, data.value)
          break
      }
    },

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
