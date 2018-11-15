export const CONTROLLER_CHANNEL_PROPS = [
  {
    name: 'Feedback Offset',
    prop: 'postEffects.bloom.feedbackOffset',
    min: -1,
    max: 1
  }
]

export const CONTROLLER_CHANNEL_PROPS_MAP =
  CONTROLLER_CHANNEL_PROPS.reduce((map, item) => {
    map[item.prop] = item
    return map
  }, {})
