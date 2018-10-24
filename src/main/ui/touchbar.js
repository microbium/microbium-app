import { join as pathJoin } from 'path'
import { TouchBar, nativeImage } from 'electron'
import { PALETTE_TYPES } from '@renderer/constants/types'

const {
  TouchBarGroup,
  TouchBarButton,
  TouchBarSpacer,
  TouchBarPopover,
  TouchBarSegmentedControl
} = TouchBar

// ------------------------------------------------------------
// Palette TouchBar
// ----------------

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
      icon: createIcon(`${id}-alt`)
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

// ------------------------------------------------------------
// Editor TouchBar
// ---------------

export function createEditorTouchBar (actions) {
  const simulation = createSimulationControls(actions)
  const styles = createStyleControls(actions)
  const constraints = createConstraintControls(actions)
  // const lineEditor = createLineEditor(actions)

  const touchbar = new TouchBar({
    items: [
      simulation,
      new TouchBarSpacer({ size: 'large' }),
      styles,
      new TouchBarSpacer({ size: 'small' }),
      constraints
      // new TouchBarSpacer({ size: 'large' }),
      // lineEditor
    ]
  })

  Object.assign(touchbar, {
    syncSimulationRunningState: simulation.syncRunningState,
    syncSimulationPausedState: simulation.syncPausedState,
    syncStyles: styles.syncSelector,
    syncConstraintGroups: constraints.syncSelector
  })

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
    icon: icons.pauseActive,
    actionName: 'toggleSimulationPause'
  }])

  controls.syncRunningState = (isRunning) => {
    const playItem = controls.itemsMap['simulation-play']
    playItem.icon = isRunning ? icons.stop : icons.play
  }

  controls.syncPausedState = (isPaused) => {
    const pauseItem = controls.itemsMap['simulation-pause']
    pauseItem.icon = isPaused ? icons.pause : icons.pauseActive
  }

  return controls
}

function createStyleControls (actions) {
  return createControlsSelector(actions, {
    iconName: 'styles',
    actionName: 'selectStyleLayer'
  })
}

function createConstraintControls (actions) {
  return createControlsSelector(actions, {
    iconName: 'constraints',
    actionName: 'selectConstraintGroup'
  })
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
  const items = actionItems.map((options) => {
    const { name, icon, backgroundColor, actionName, actionArgs } = options
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

function createControlsSelector (actions, options) {
  const actionHandler = actions[options.actionName]
  const selector = new TouchBarSegmentedControl({
    // segmentStyle: 'separated',
    segments: [],
    change (selectedIndex) {
      actionHandler(selectedIndex)
    }
  })
  const popover = new TouchBarPopover({
    icon: createIcon(options.iconName),
    items: [selector]
  })

  popover.syncSelector = (items) => {
    selector.segments = items.map(({ name }) => ({
      label: name
    }))
  }

  return popover
}

function createIcon (name) {
  return nativeImage.createFromPath(
    pathJoin(__static, `icons/touchbar/${name}.png`))
}
