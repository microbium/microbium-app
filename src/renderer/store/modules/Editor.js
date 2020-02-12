import { vec2, vec3, vec4 } from 'gl-matrix'
import { pixelRatio } from '@renderer/utils/screen'
import { createControlsState } from './Palette'

export function createCompositorState () {
  const seek = {
    timePrev: 0,
    velocity: 0,
    velocitySmoothed: 0,
    screen: vec2.create(),
    move: vec2.create(),
    movePrev: vec2.create(),
    wheelOffset: 0,
    hand: vec3.create(),
    index: null,
    maxDistance: 14,
    proximateDistance: 60,
    proximateIndices: []
  }

  const drag = {
    shouldNavigate: false,
    shouldZoom: false,

    isDown: false,
    isDragging: false,
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
    showStats: false,
    didResize: false,
    pixelRatioNative: pixelRatio(),
    pixelRatioClamped: 0,
    size: vec2.create(),
    bounds: vec4.create(),
    resolution: vec2.create(),
    resolutionMax: vec2.create(),
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
    activeDepth: null,
    prevPoint: null,
    candidatePoint: null,
    linkSizeMin: 12,
    linkSizeMinStrokeFactor: 2,
    shouldAppend: false,
    shouldAppendOnce: false,
    segments: [],
    vertices: []
  }

  const simulation = {
    wasRunning: false,
    isRunning: false,
    isPaused: false,
    tick: 0,
    forcesCount: null,
    pinConstraintCount: null,
    localConstraintCount: null
  }

  const recording = {
    isActive: false,
    tick: 0
  }

  const renderer = {
    lastRenderHash: null,
    needsUpdate: false, // Force render escape hatch
    updateOverlapTick: 0,
    drawCalls: 0,
    fullScreenPasses: 0,
    lineQuads: 0,
    verticesCount: 0,
    segmentsCount: 0
  }

  const controls = createControlsState()

  return {
    seek,
    drag,
    viewport,
    input,
    geometry,
    simulation,
    recording,
    renderer,
    controls
  }
}

export function hashRenderState (state) {
  return '' +
    state.seek.index +
    state.seek.wheelOffset.toFixed(6) +
    proximateIndicesStr(state.seek.proximateIndices) +
    boolStr(state.drag.isDown) +
    boolStr(state.drag.isDragging) +
    vec2Str(state.drag.move) +
    vec2Str(state.drag.panOffset) +
    state.drag.zoomOffset +
    vec2Str(state.viewport.size) +
    vec2Str(state.viewport.offset) +
    state.viewport.scale +
    state.geometry.segments.length +
    state.geometry.vertices.length +
    boolStr(state.simulation.isRunning) +
    state.simulation.tick
}

function boolStr (bool) {
  return bool ? '1' : '0'
}
function vec2Str (v) {
  return v[0] + ',' + v[1]
}
function proximateIndicesStr (proximateIndices) {
  if (!proximateIndices.length) return ''
  const { index, factor } = proximateIndices[0]
  return index + ',' + factor
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
