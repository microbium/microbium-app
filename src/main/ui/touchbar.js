import { join as pathJoin } from 'path'
import { TouchBar, nativeImage } from 'electron'
import { PALETTE_TYPES } from '@renderer/constants/types'

const {
  TouchBarGroup,
  TouchBarButton,
  TouchBarSpacer,
  TouchBarSegmentedControl
} = TouchBar

export function createPaletteTouchBar (actions) {
  const paletteSelector = createPaletteSelector(actions)
  const touchbar = new TouchBar({
    items: [
      paletteSelector
    ]
  })

  touchbar.syncActivePalette = paletteSelector.syncActivePalette

  return touchbar
}

function createPaletteSelector (actions) {
  const palettes = PALETTE_TYPES
  const control = new TouchBarSegmentedControl({
    // segmentStyle: 'separated',
    segments: palettes.map(({ id }) => ({
      icon: createIcon(id)
    })),
    change (selectedIndex) {
      const { id } = palettes[selectedIndex]
      actions.setActivePalette(id)
    }
  })

  control.syncActivePalette = (id) => {
    const index = palettes.findIndex((item) => item.id === id)
    control.selectedIndex = index
    return index
  }

  return control
}

export function createEditorTouchBar (actions) {
  const simulationControls = createSimulationControls(actions)
  const styleNavigator = createStyleNavigator(actions)
  const constraintNavigator = createConstraintNavigator(actions)
  // const lineEditor = createLineEditor(actions)

  const touchbar = new TouchBar({
    items: [
      simulationControls,
      new TouchBarSpacer({ size: 'large' }),
      styleNavigator,
      new TouchBarSpacer({ size: 'small' }),
      constraintNavigator
      // new TouchBarSpacer({ size: 'large' }),
      // lineEditor
    ]
  })

  touchbar.syncSimulationRunningState = simulationControls.syncRunningState
  touchbar.syncSimulationPausedState = simulationControls.syncPausedState

  return touchbar
}

function createSimulationControls (actions) {
  const icons = {
    play: createIcon('simulation-play'),
    stop: createIcon('simulation-stop'),
    pause: createIcon('simulation-pause'),
    pauseActive: createIcon('simulation-pause-active')
  }
  const controls = createControlsGroup(actions, [{
    name: 'simulation-play',
    icon: icons.play,
    actionName: 'toggleSimulation'
  }, {
    name: 'simulation-pause',
    icon: icons.pause,
    actionName: 'toggleSimulationPause'
  }])

  controls.syncRunningState = (isRunning) => {
    const playItem = controls.itemsMap['simulation-play']
    playItem.icon = isRunning ? icons.stop : icons.play
  }

  controls.syncPausedState = (isPaused) => {
    const pauseItem = controls.itemsMap['simulation-pause']
    pauseItem.icon = isPaused ? icons.pauseActive : icons.pause
  }

  return controls
}

function createStyleNavigator (actions) {
  return createControlsGroup(actions, [{
    name: 'styles-prev',
    actionName: 'selectNextStyleLayer',
    actionArgs: [-1]
  }, {
    name: 'styles-next',
    actionName: 'selectNextStyleLayer',
    actionArgs: [1]
  }])
}

function createConstraintNavigator (actions) {
  return createControlsGroup(actions, [{
    name: 'constraints-prev',
    actionName: 'selectNextConstraintGroup',
    actionArgs: [-1]
  }, {
    name: 'constraints-next',
    actionName: 'selectNextConstraintGroup',
    actionArgs: [1]
  }])
}

/*
function createLineEditor (actions) {
  return createControlsGroup(actions, [{
    name: 'styles-prev',
    actionName: 'deleteLastVertex'
  }, {
    name: 'styles-prev',
    actionName: 'completeSegment'
  }, {
    name: 'styles-prev',
    actionName: 'deleteLastSegment'
  }])
}
*/

function createControlsGroup (actions, actionItems) {
  const itemsMap = {}
  const items = actionItems.map(({ name, icon, backgroundColor, actionName, actionArgs }) => {
    const item = new TouchBarButton({
      icon: icon || createIcon(name),
      backgroundColor,
      click () {
        actions[actionName].apply(actions, actionArgs || null)
      }
    })
    itemsMap[name] = item
    return item
  })

  const group = new TouchBarGroup({ items })
  group.itemsMap = itemsMap

  return group
}

function createIcon (name) {
  return nativeImage.createFromPath(
    pathJoin(__static, `icons/touchbar/${name}.png`))
}
