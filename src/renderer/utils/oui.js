import ouioui from 'ouioui'

const {
  annotate,
  controls,
  datoui
} = ouioui

const ANNOTATORS = []
function addAnnotator (fn, ...keys) {
  ANNOTATORS.push({
    keys, fn
  })
}

function setupAnnotators () {
  addAnnotator(annotateMaterial, 'color')
}

export function createStateControls (config) {
  return datoui(config)
}

export function annotateState (state) {
  if (!ANNOTATORS.length) setupAnnotators()
  Object.keys(state).forEach((key) => {
    const value = state[key]
    if (typeof value !== 'object') return
    const annotator = ANNOTATORS.find((item) => (
      hasProps(value, item.keys)
    ))
    if (annotator) {
      state[key] = annotator.fn(value)
    }
  })
  return state
}

function hasProps (state, keys) {
  return keys.reduce((prev, key) => (
    state[key] !== undefined && prev === true
  ), true)
}

const colorPicker = annotate({
  control: controls.ColorPicker
})

function annotateMaterial ({ color }) {
  return {
    @colorPicker color
  }
}
