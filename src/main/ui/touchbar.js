import { join as pathJoin } from 'path'
import { TouchBar, nativeImage } from 'electron'

const {
  // TouchBarButton,
  TouchBarSegmentedControl
} = TouchBar

export function createPaletteTouchBar (actions) {
  const paletteSelector = createPaletteSelector(actions)
  return new TouchBar([
    paletteSelector
  ])
}

function createPaletteSelector (actions) {
  const palettes = [
    'tool',
    'geometry',
    'styles',
    'constraints',
    'forces',
    'viewport',
    'effects'
  ]

  return new TouchBarSegmentedControl({
    segments: palettes.map((id) => ({
      icon: createIcon(id)
    })),
    change (selectedIndex) {
      const id = palettes[selectedIndex]
      actions.setActivePalette(id)
    }
  })
}

function createIcon (name) {
  return nativeImage.createFromPath(
    pathJoin(__static, `icons/touchbar/${name}.png`))
}
