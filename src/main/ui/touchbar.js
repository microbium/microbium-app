import { join as pathJoin } from 'path'
import { TouchBar, nativeImage } from 'electron'
import { PALETTE_TYPES } from '@renderer/constants/types'

const {
  TouchBarGroup,
  TouchBarButton,
  TouchBarColorPicker,
  TouchBarSlider,
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
    segments: palettes.map(({ id }) => ({
      icon: createIcon(`${id}`)
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
  const stroke = createStrokeControls(actions)
  const styles = createStyleControls(actions)
  const constraints = createConstraintControls(actions)

  const touchbar = new TouchBar({
    items: [
      simulation,
      new TouchBarSpacer({ size: 'small' }),
      stroke,
      styles,
      constraints
    ]
  })

  Object.assign(touchbar, {
    syncSimulationRunningState: simulation.syncRunningState,
    syncSimulationPausedState: simulation.syncPausedState,
    syncStroke: stroke.sync,
    syncStyles: styles.sync,
    syncConstraintGroups: constraints.sync
  })

  return touchbar
}

function createSimulationControls (actions) {
  const icons = {
    play: createIcon('simulation-play'),
    stop: createIcon('simulation-stop'),
    pause: createIcon('simulation-pause-inactive'),
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

function createStrokeControls (actions) {
  const baseSlider = new TouchBarSlider({
    value: 15,
    minValue: 1,
    maxValue: 50,
    change (value) {
      const width = value / 10
      actions.setStrokeWidth(width)
    }
  })
  const modSelector = new TouchBarSegmentedControl({
    segments: ['No', 'Vel', 'Pn Pr', 'Scrl'].map((label) => ({ label })),
    selectedIndex: 1,
    change (selectedIndex) {
      actions.setInputModType(selectedIndex)
    }
  })
  const colorSelector = new TouchBarColorPicker({
    change (colorHex) {
      actions.setStrokeColor(colorHex)
    }
  })

  const popover = new TouchBarPopover({
    icon: createIcon('tool'),
    items: [baseSlider, modSelector]
  })

  const group = new TouchBarGroup({
    items: [popover, colorSelector]
  })

  group.sync = (lineTool) => {
    const { strokeWidth, strokeColor, inputModTypeIndex } = lineTool
    const sliderStrokeWidth = Math.round(strokeWidth * 10)

    if (baseSlider.value !== sliderStrokeWidth) {
      baseSlider.value = sliderStrokeWidth
    }
    if (modSelector.selectedIndex !== inputModTypeIndex) {
      modSelector.selectedIndex = inputModTypeIndex
    }
    if (colorSelector.selectedColor !== strokeColor) {
      colorSelector.selectedColor = strokeColor
    }
  }

  return group
}

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
    segments: [],
    change (selectedIndex) {
      actionHandler(selectedIndex)
    }
  })
  const popover = new TouchBarPopover({
    icon: createIcon(options.iconName),
    items: [
      new TouchBarSpacer({ size: 'small' }),
      selector
    ]
  })

  popover.sync = (items, selectedIndex) => {
    selector.segments = items.map(({ name }) => ({
      label: name
    }))
    selector.selectedIndex = selectedIndex
  }

  return popover
}

function createIcon (name) {
  return nativeImage.createFromPath(
    pathJoin(__static, `icons/touchbar/${name}.png`))
}
