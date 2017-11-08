import { vec2 } from 'gl-matrix'
import { createControlsState } from './Palette'

export function createCompositorState () {
  const seek = {
    timePrev: 0,
    velocity: 0,
    move: vec2.create(),
    movePrev: vec2.create(),
    index: null,
    minDistance: 14
  }

  const drag = {
    shouldNavigate: false,
    shouldZoom: false,

    isDown: false,
    isDrawing: false,
    isPanning: false,
    isZooming: false,

    panDown: vec2.create(),
    panOffset: vec2.create(),
    zoomDown: 1,
    zoomOffset: 0,
    pressure: 0.5,

    down: vec2.create(),
    move: vec2.create(),
    movePrev: vec2.create(),
    up: vec2.create(),
    upPrev: vec2.create(),
    upTimeLast: 0
  }

  const viewport = {
    controlsVisible: false,
    pixelRatio: 1,
    size: vec2.create(),
    center: vec2.create(),
    offset: vec2.create(),
    scale: 1
  }

  const input = {
    alt: false,
    control: false,
    shift: false
  }

  const geometry = {
    activeSegment: null,
    activeSegmentIsConnected: false,
    prevPoint: null,
    candidatePoint: null,
    linkSizeMin: 12,
    shouldAppend: false,
    shouldAppendOnce: false,
    segments: [],
    vertices: []
  }

  const simulation = {
    isRunning: false,
    tick: 0,
    system: null
  }

  const renderer = {
    drawCalls: 0
  }

  const controls = createControlsState()

  return {
    seek,
    drag,
    viewport,
    input,
    geometry,
    simulation,
    renderer,
    controls
  }
}

// TODO: Maybe implement some compositor state in observable store
const state = {}
const mutations = {}
const actions = {}

export default {
  state,
  mutations,
  actions
}
