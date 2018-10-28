export const LINE_WIDTH = {
  ULTRA_THIN: 0.5,
  THIN: 1,
  REGULAR: 2,
  THICK: 4,
  FAT: 8
}

export const LINE_WIDTH_KEYS = [
  'ULTRA_THIN',
  'THIN',
  'REGULAR',
  'THICK',
  'FAT'
]

export const TEXTURES = {
  'watercolor': {
    path: require('@renderer/assets/images/textures/watercolor.jpg'),
    size: 2048
  },
  'ground-mud': {
    path: require('@renderer/assets/images/textures/ground-mud.jpg'),
    size: 2048
  },
  'alpha-hairy': {
    path: require('@renderer/assets/images/textures/alpha-hairy.jpg'),
    size: 256
  },
  'alpha-hatchy': {
    path: require('@renderer/assets/images/textures/alpha-hatchy.jpg'),
    size: 256
  }
}
