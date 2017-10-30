import { vec2 } from 'gl-matrix'
import { LINE_WIDTH_KEYS } from '@/constants/line-styles'

function createCompositorState () {
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
    drawCalls: 0,
    lineStyles: [
      {
        diffuseMap: 'watercolor',
        hatchAlpha: 0,
        tint: [1, 1, 1, 1],
        useScreenTintFunc: 1,
        thickness: 1
      },
      {
        diffuseMap: null,
        hatchAlpha: 1,
        tint: [0.2, 0.1, 0.3, 1],
        useScreenTintFunc: 0,
        thickness: 1
      }
    ]
  }

  const controls = {
    // FEAT: Enable more fine control over lineWidth
    // Mainly need to refactor serialization of geometry state
    lineWidth: 'REGULAR',
    lineStyleIndex: 0,
    lineColor: '#fafafa',
    lineAlpha: 1,
    _lineWidthStep: 2,
    get lineWidthStep () {
      return this._lineWidthStep
    },
    set lineWidthStep (step) {
      this._lineWidthStep = step
      this.lineWidth = LINE_WIDTH_KEYS[step]
      return step
    },
    polarIterations: 8,
    curveSubDivisions: 6
  }

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

export {
  createCompositorState
}
export default {
  state,
  mutations,
  actions
}
