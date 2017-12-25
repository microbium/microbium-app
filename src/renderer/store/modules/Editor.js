import { vec2 } from 'gl-matrix'
import { createControlsState } from './Palette'

export function createCompositorState () {
  const seek = {
    timePrev: 0,
    velocity: 0,
    move: vec2.create(),
    movePrev: vec2.create(),
    index: null,
    maxDistance: 14
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

  // TODO: Expose pixelRatio setting to user
  const viewport = {
    showStats: false,
    didResize: false,
    pixelRatio: Math.min(1.5, (window.devicePixelRatio || 1)),
    size: vec2.create(),
    resolution: vec2.create(),
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
    prevPoint: null,
    candidatePoint: null,
    linkSizeMin: 12,
    shouldAppend: false,
    shouldAppendOnce: false,
    segments: [],
    vertices: []
  }

  const simulation = {
    wasRunning: false,
    isRunning: false,
    tick: 0,
    forcesCount: null,
    pinConstraintCount: null,
    localConstraintCount: null
  }

  const renderer = {
    lastRenderHash: null,
    needsUpdate: false, // Force render escape hatch
    updateOverlapTick: 0,
    drawCalls: 0,
    fullScreenPasses: 0,
    lineQuads: 0
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

export function hashRenderState (state) {
  return [
    state.seek.index,
    boolStr(state.drag.isDown),
    vec2Str(state.drag.move),
    vec2Str(state.drag.panOffset),
    state.drag.zoomOffset,
    vec2Str(state.viewport.size),
    vec2Str(state.viewport.offset),
    state.viewport.scale,
    state.geometry.segments.length,
    state.geometry.vertices.length,
    boolStr(state.simulation.isRunning),
    state.simulation.tick
  ].join('-')
}

function boolStr (bool) {
  return bool ? '1' : '0'
}
function vec2Str (v) {
  return v[0] + ',' + v[1]
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
