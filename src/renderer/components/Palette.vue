<template>
  <div class="palette"
    v-on:mouseenter="mouseEnter">
    <div class="palette__toolbar">
      <div @click="close" class="palette__close"></div>
      <div class="palette__toolbar__modes">
        <!--
        <palette-modes
          :activeMode="controls.activeMode"
          :modeTypes="params.modeTypes" />
        -->
        <palette-modes
          :activeMode="controls.activePalettes"
          :modeTypes="params.paletteTypes" />
      </div>
    </div>

    <div class="palette__content">
      <palette-group open
        :hidden="!showToolPanels">
        <h2 slot="title">{{ paletteTypesMap.tool.name }}</h2>
        <palette-tool :model="controls.lineTool"
          :styles="controls.styles"
          :constraints="controls.constraintGroups"
          :inputModTypes="params.inputModTypes"
          :physicsTypes="params.physicsTypes" />
      </palette-group>

      <palette-group open
        :hidden="!showGeometryPanels">
        <h2 slot="title">{{ paletteTypesMap.geometry.name }}</h2>
        <palette-modifiers :model="controls.modifiers" />
      </palette-group>

      <palette-group open
        :hidden="!showStylePanels">
        <h2 slot="title">{{ paletteTypesMap.styles.name }}</h2>
        <palette-style-list
          :list="controls.styles"
          :textures="controls.textures"
          :alphaTextures="controls.alphaTextures"
          :alphaFunctions="controls.alphaFunctions"
          :willRemoveListItem="willRemoveStyle" />
      </palette-group>

      <palette-group open
        :hidden="!showForcesPanels">
        <h2 slot="title">{{ paletteTypesMap.forces.name }}</h2>
        <palette-force-list
          :list="controls.forces"
          :forceTypes="params.forceTypes"
          :forcePositionTypes="params.forcePositionTypes"
          :forceIntensityTypes="params.forceIntensityTypes" />
        </palette-group>
      </palette-group>

      <palette-group open
        :hidden="!showConstraintsPanels">
        <h2 slot="title">{{ paletteTypesMap.constraints.name }}</h2>
        <palette-constraint-list
          :list="controls.constraintGroups"
          :constraintTypes="params.constraintTypes"
          :willRemoveListItem="willRemoveConstraint" />
      </palette-group>

      <palette-group open
        :hidden="!showViewportPanel">
        <h2 slot="title">{{ paletteTypesMap.viewport.name }}</h2>
        <palette-viewport :model="controls.viewport" />
      </palette-group>

      <palette-group open
        :hidden="!showEffectsPanels">
        <h2 slot="title">{{ paletteTypesMap.effects.name }}</h2>
        <palette-effects :model="controls.postEffects" />
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
import {
  createControlsState,
  createControlsStaticParams
} from '@src/store/modules/Palette'

import Icon from '@src/components/display/Icon'
import InputText from '@src/components/input/Text'
import InputButton from '@src/components/input/Button'
import PaletteModes from '@src/components/palette/Modes'
import PaletteGroup from '@src/components/palette/Group'
import PaletteTool from '@src/components/palette/Tool'
import PaletteForceList from '@src/components/palette/ForceList'
import PaletteConstraintList from '@src/components/palette/ConstraintList'
import PaletteStyleList from '@src/components/palette/StyleList'
import PaletteModifiers from '@src/components/palette/Modifiers'
import PaletteViewport from '@src/components/palette/Viewport'
import PaletteEffects from '@src/components/palette/Effects'

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
  },

  methods: {
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

    mainDidUpdateControls () {
      this._mainDidUpdateControls = true
      setTimeout(() => {
        this._mainDidUpdateControls = false
      }, 0)
    },

    // OPTIM: Improve syncing controls
    syncControls (group, value) {
      if (this._mainDidUpdateControls) return
      this.$electron.ipcRenderer.send('main-message', {
        type: 'UPDATE_CONTROLS',
        group,
        value
      })
    },

    willRemoveStyle (style, index) {
      this.$electron.ipcRenderer.send('main-message', {
        type: 'MERGE_SEGMENT_PROP',
        propName: 'styleIndex',
        indexFrom: index,
        indexTo: index - 1
      })
    },

    willRemoveConstraint (constraint, index) {
      this.$electron.ipcRenderer.send('main-message', {
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
      this.$electron.ipcRenderer.send('toggle-window', {
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
    'controls.postEffects': createStateSyncer('postEffects')
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
