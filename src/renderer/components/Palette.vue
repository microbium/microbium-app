<template>
  <div class="palette" :style="themeStyle"
    v-on:mouseenter="mouseEnter">
    <div class="palette__toolbar">
      <div @click="close" class="palette__close"></div>
      <div class="palette__toolbar__modes">
        <palette-modes
          :activeMode="controls.activePalettes"
          :modeTypes="params.paletteTypes" />
      </div>
    </div>

    <div class="palette__content">
      <palette-section :hidden="!showToolPanels">
        <h2 slot="title">{{ paletteTypesMap.tool.name }}</h2>
        <palette-tool :model="controls.lineTool"
          :styles="controls.styles"
          :constraints="controls.constraintGroups"
          :inputModTypes="params.inputModTypes"
          :physicsTypes="params.physicsTypes" />
      </palette-section>

      <palette-section :hidden="!showGeometryPanels">
        <h2 slot="title">{{ paletteTypesMap.geometry.name }}</h2>
        <palette-modifiers :model="controls.modifiers" />
      </palette-section>

      <palette-section :hidden="!showStylePanels">
        <h2 slot="title">{{ paletteTypesMap.styles.name }}</h2>
        <palette-style-list
          :list="controls.styles"
          :textures="controls.textures"
          :alphaTextures="controls.alphaTextures"
          :alphaFunctions="controls.alphaFunctions"
          :willRemoveListItem="willRemoveStyle" />
      </palette-section>

      <palette-section :hidden="!showForcesPanels">
        <h2 slot="title">{{ paletteTypesMap.forces.name }}</h2>
        <palette-force-list
          :list="controls.forces"
          :forceTypes="params.forceTypes"
          :forcePositionTypes="params.forcePositionTypes"
          :forceIntensityTypes="params.forceIntensityTypes" />
      </palette-section>

      <palette-section :hidden="!showConstraintsPanels">
        <h2 slot="title">{{ paletteTypesMap.constraints.name }}</h2>
        <palette-constraint-list
          :list="controls.constraintGroups"
          :constraintTypes="params.constraintTypes"
          :willRemoveListItem="willRemoveConstraint" />
      </palette-section>

      <palette-section :hidden="!showViewportPanel">
        <h2 slot="title">{{ paletteTypesMap.viewport.name }}</h2>
        <palette-viewport :model="controls.viewport" />
      </palette-section>

      <palette-section :hidden="!showEffectsPanels">
        <h2 slot="title">{{ paletteTypesMap.effects.name }}</h2>
        <palette-effects :model="controls.postEffects" />
      </palette-section>
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

    &__modes {
      position: absolute;
      top: 0;
      right: 8px;

      display: flex;
      justify-content: flex-end;
      width: calc(100% - 40px);
      height: 100%;
    }
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
      background: #aaa;
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

  hr {
    border: none;
    border-bottom: 2px solid #fff;
    margin: 4px 8px 10px;
    padding: 0;
    width: 10%;
    opacity: 0.1;
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
import Colr from 'colr'

import { clamp } from '@renderer/utils/math'

import {
  createControlsState,
  createControlsStaticParams
} from '@renderer/store/modules/Palette'

import Icon from '@renderer/components/display/Icon'
import InputText from '@renderer/components/input/Text'
import InputButton from '@renderer/components/input/Button'
import PaletteModes from '@renderer/components/palette/Modes'
import PaletteSection from '@renderer/components/palette/Section'
import PaletteGroup from '@renderer/components/palette/Group'
import PaletteTool from '@renderer/components/palette/Tool'
import PaletteForceList from '@renderer/components/palette/ForceList'
import PaletteConstraintList from '@renderer/components/palette/ConstraintList'
import PaletteStyleList from '@renderer/components/palette/StyleList'
import PaletteModifiers from '@renderer/components/palette/Modifiers'
import PaletteViewport from '@renderer/components/palette/Viewport'
import PaletteEffects from '@renderer/components/palette/Effects'

const DEBUG_DISABLE_FOCUS = false

export default {
  name: 'palette',

  components: {
    Icon,
    InputButton,
    InputText,
    PaletteConstraintList,
    PaletteEffects,
    PaletteForceList,
    PaletteSection,
    PaletteGroup,
    PaletteModes,
    PaletteModifiers,
    PaletteStyleList,
    PaletteTool,
    PaletteViewport
  },

  data () {
    return {
      controls: createControlsState(),
      params: createControlsStaticParams()
    }
  },

  created () {
    this.$electron.ipcRenderer.on('message', this.handleMessage.bind(this))
    this.$electron.ipcRenderer.on('command', this.handleCommand.bind(this))
  },

  mounted () {
    this.bindEvents()
  },

  methods: {
    bindEvents () {
      window.addEventListener('wheel', this.handleWheel.bind(this), false)
    },

    handleWheel (event) {
      if (event.ctrlKey) event.preventDefault()
    },

    handleMessage (event, data) {
      const { controls } = this

      switch (data.type) {
        case 'UPDATE_CONTROLS':
          this.mainDidUpdateControls()
          if (data.key) controls[data.group][data.key] = data.value
          else if (data.group) Object.assign(controls[data.group], data.value)
          else Object.assign(controls, data.value)
          break
      }
    },

    handleCommand (event, data) {
      const { activePalettes, lineTool, styles, constraintGroups } = this.controls

      this.menuDidUpdateControls()
      switch (data.action) {
        case 'SET_ACTIVE_PALETTE':
          activePalettes.id = data.id
          break
        case 'SET_STROKE_WIDTH':
          lineTool.strokeWidth = data.value
          break
        case 'SET_STROKE_COLOR':
          lineTool.strokeColor = data.value
          break
        case 'SET_INPUT_MOD_TYPE':
          lineTool.inputModTypeIndex = data.value
          break
        case 'SELECT_STYLE_LAYER':
          lineTool.styleIndex = data.index
          break
        case 'SELECT_NEXT_STYLE_LAYER':
          lineTool.styleIndex = clamp(0, styles.length - 1,
            lineTool.styleIndex + data.dir)
          break
        case 'SELECT_CONSTRAINT_GROUP':
          lineTool.constraintIndex = data.index
          break
        case 'SELECT_NEXT_CONSTRAINT_GROUP':
          lineTool.constraintIndex = clamp(0, constraintGroups.length - 1,
            lineTool.constraintIndex + data.dir)
          break
      }
    },

    sendMessage (name, data) {
      const { ipcRenderer } = this.$electron
      ipcRenderer.send(name, data)
    },

    mainDidUpdateControls () {
      this._mainDidUpdateControls = true
      setTimeout(() => {
        this._mainDidUpdateControls = false
      }, 0)
    },

    menuDidUpdateControls () {
      this._menuDidUpdateControls = true
      setTimeout(() => {
        this._menuDidUpdateControls = false
      }, 0)
    },

    syncActivePaletteMode (id) {
      this.sendMessage('menu-message', {
        type: 'UPDATE_ACTIVE_PALETTE',
        id
      })
    },

    // OPTIM: Improve syncing controls
    syncControls (group, value) {
      if (this._mainDidUpdateControls) return
      const target = this._menuDidUpdateControls ? 'main' : 'main+menu'
      console.log('syncControls', target)
      this.sendMessage(`${target}-message`, {
        type: 'UPDATE_CONTROLS',
        group,
        value
      })
    },

    willRemoveStyle (style, index) {
      this.sendMessage('main-message', {
        type: 'MERGE_SEGMENT_PROP',
        propName: 'styleIndex',
        indexFrom: index,
        indexTo: index - 1
      })
    },

    willRemoveConstraint (constraint, index) {
      this.sendMessage('main-message', {
        type: 'MERGE_SEGMENT_PROP',
        propName: 'constraintIndex',
        indexFrom: index,
        indexTo: index - 1
      })
    },

    // NOTE: Hacky way to fix hidden cursor on mouse-enter from editor
    // Maybe there's a better way to do this ... ?
    // FIXME: Still an issue with regaining focus after using <select> inputs
    mouseEnter () {
      if (DEBUG_DISABLE_FOCUS) return
      this.$electron.remote.getCurrentWindow().focus()
    },

    close () {
      this.sendMessage('toggle-window', {
        key: 'palette'
      })
    }
  },

  computed: {
    paletteTypesMap () {
      const { paletteTypes } = this.params
      return paletteTypes.reduce((map, type) => {
        map[type.id] = type
        return map
      }, {})
    },

    themeHighlight () {
      const { colorHex } = this.controls.viewport.background
      const { colorShift } = this.controls.postEffects
      const backgroundColor = Colr.fromHex(colorHex).toHslArray()

      const hue = (backgroundColor[0] + colorShift[0] * 360) % 360 - 30
      const saturation = clamp(0, 100, (backgroundColor[1] + colorShift[1] * 100) * 5)
      const lightness = clamp(0, 100, 70 - (backgroundColor[2] + colorShift[2] * 100) * 0.1)

      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    },

    themeStyle () {
      const { themeHighlight } = this
      return {
        '--highlight-color': themeHighlight
      }
    },

    isDrawMode: createModeCondition('activeMode', 'draw'),
    isSelectMode: createModeCondition('activeMode', 'select'),

    showToolPanels: createModeCondition('activePalettes', 'tool'),
    showGeometryPanels: createModeCondition('activePalettes', 'geometry'),
    showStylePanels: createModeCondition('activePalettes', 'styles'),
    showForcesPanels: createModeCondition('activePalettes', 'forces'),
    showConstraintsPanels: createModeCondition('activePalettes', 'constraints'),
    showViewportPanel: createModeCondition('activePalettes', 'viewport'),
    showEffectsPanels: createModeCondition('activePalettes', 'effects')
  },

  watch: {
    'controls.lineTool': createStateSyncer('lineTool'),
    'controls.styles': createStateSyncer('styles'),
    'controls.forces': createStateSyncer('forces'),
    'controls.constraintGroups': createStateSyncer('constraintGroups'),
    'controls.modifiers': createStateSyncer('modifiers'),
    'controls.viewport': createStateSyncer('viewport'),
    'controls.postEffects': createStateSyncer('postEffects'),
    'controls.activePalettes.id': function (id) {
      this.syncActivePaletteMode(id)
    }
  }
}

function createModeCondition (modeType, id) {
  return function () {
    return this.controls[modeType].id === id
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
