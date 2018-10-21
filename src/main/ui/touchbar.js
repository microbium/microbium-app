import { join as pathJoin } from 'path'
import { TouchBar, nativeImage } from 'electron'
import { PALETTE_TYPES } from '@renderer/constants/types'

const {
  // TouchBarButton,
  TouchBarSegmentedControl
} = TouchBar

export function createPaletteTouchBar (actions) {
  const paletteSelector = createPaletteSelector(actions)
  const touchbar = new TouchBar([
    paletteSelector
  ])

  touchbar.syncActivePalette = paletteSelector.syncActivePalette

  return touchbar
}

function createPaletteSelector (actions) {
  const palettes = PALETTE_TYPES
  const control = new TouchBarSegmentedControl({
    segments: palettes.map(({ id }) => ({
      icon: createIcon(id)
    })),
    change (selectedIndex) {
      const { id } = palettes[selectedIndex]
      actions.setActivePalette(id)
    }
  })

  control.syncActivePalette = function (id) {
    const index = palettes.findIndex((item) => item.id === id)
    control.selectedIndex = index
    return index
  }

  return control
}

function createIcon (name) {
  return nativeImage.createFromPath(
    pathJoin(__static, `icons/touchbar/${name}.png`))
}
