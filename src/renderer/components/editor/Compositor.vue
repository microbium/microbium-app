<template>
  <div class="editor-compositor">
    <div class="editor-compositor__scene" ref="scene"></div>
    <div class="editor-compositor__stats" v-if="state && state.viewport.showStats">
      <div>resolution: {{ state.viewport.resolution[0] }}w
        {{ state.viewport.resolution[1] }}h
        ({{ state.viewport.pixelRatio }}x)</div>
      <hr />
      <div>line quads: {{ state.renderer.lineQuads }}</div>
      <hr />
      <div>draw calls: {{ state.renderer.drawCalls }}</div>
      <div>full screen passes: {{ state.renderer.fullScreenPasses }}</div>
    </div>
  </div>
</template>

<style lang="scss">
.editor-compositor {
  &__scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &__stats {
    position: absolute;
    bottom: 14px;
    left: 14px;

    color: #444;
    font: 10px/1 Monaco, monospace;
    pointer-events: none;

    > hr {
      border: none;
      border-top: 1px solid #888;
      margin: 4px 0;
      width: 20px;
    }
  }
}

.mode--simulate {
  cursor: none;
}
.mode--edit {
  cursor: crosshair;
}
</style>

<script>
import { vec2, mat4 } from 'gl-matrix'
import createREGL from 'regl'
import Colr from 'colr'

import { TEXTURES } from '@/constants/line-styles'

import { createTaskManager } from '@/utils/task'
import { createLoop } from '@/utils/loop'
import { createPostBuffers } from '@/utils/fbo'
import { debounce } from '@/utils/function'
import { range } from '@/utils/array'
import { lerp } from '@/utils/math'
import { logger } from '@/utils/logger'

import { createTextureManager } from '@/utils/texture'
import {
  createDrawRect,
  createSetupDrawScreen,
  createDrawBoxBlur,
  createDrawScreen
} from '@/draw/commands/screen-space'
import { createCompositorState } from '@/store/modules/Editor'

import { createCameras } from './compositor/cameras'
import { createScene, createUIScene } from './compositor/scenes'
import { createGeometryController } from './compositor/geometry'
import { createSimulationController } from './compositor/simulation'
import { createSeekController, createDragController } from './compositor/interaction'
import { createViewportController } from './compositor/viewport'
import { createIOController } from './compositor/io'

import {
  drawSimulatorForceUI,
  drawSimulatorOriginUI
} from '@/draw/routines/simulation'
import {
  drawOrigin,
  drawOriginTick,
  drawPolarGrid
} from '@/draw/routines/origin'
import {
  drawGeometry,
  drawFocus
} from '@/draw/routines/geometry'

const TICK_MSG_INTERVAL = 20
const DISABLE_RENDER = false

const scratchVec2A = vec2.create()
const scratchMat4A = mat4.create()

// TODO: Better integrate with vue component
function mountCompositor ($el, $refs, $electron) {
  const containers = {
    scene: $refs.scene
  }

  const tasks = createTaskManager(
    'inject', 'syncState',
    'update', 'render', 'resize')
  const loop = createAnimationLoop()
  const state = createCompositorState()
  const renderer = createRenderer()

  const cameras = createCameras(tasks, state, renderer)
  const scene = createScene(tasks, state, renderer)
  const sceneUI = createUIScene(tasks, state, renderer)

  const geometry = createGeometryController(tasks, state)
  const simulation = createSimulationController(tasks, state)
  const seek = createSeekController(tasks, state)
  const drag = createDragController(tasks, state)
  const viewport = createViewportController(tasks, state)
  const io = createIOController(tasks, state)

  function createRenderer () {
    const regl = createREGL({
      container: containers.scene,
      pixelRatio: state.viewport.pixelRatio,
      extensions: [
        // 'angle_instanced_arrays',
        'OES_standard_derivatives',
        'OES_element_index_uint'
      ],
      attributes: {
        antialias: false,
        preserveDrawingBuffer: false,
        premultipliedAlpha: false,
        alpha: false
      }
    })

    const textures = createTextureManager(regl, TEXTURES)
    const postBuffers = createPostBuffers(regl)
    const commands = {
      setupDrawScreen: createSetupDrawScreen(regl),
      drawScreen: createDrawScreen(regl),
      drawBoxBlur: createDrawBoxBlur(regl, {radius: 3}),
      drawRect: createDrawRect(regl)
    }

    return {
      regl,
      textures,
      postBuffers,
      commands
    }
  }

  function createAnimationLoop () {
    let animationFrame = 0
    return createLoop(null,
      () => tasks.run('update', animationFrame++),
      () => tasks.run('render', animationFrame),
      (1 / 60 * 1000))
  }

  // Update / Render

  const view = {
    inject () {
      tasks.flush('inject', containers).then(() => {
        viewport.updateClassName()
        viewport.resize()
        view.initGeometry()
        view.bindEvents()
        view.start()
        view.didStart()
      })
    },

    start () {
      tasks.run('syncState')
      view.renderOnce()
      loop.start()
    },

    didStart () {
      $electron.ipcRenderer.send('main-started')
    },

    bindEvents () {
      containers.scene.addEventListener('pointermove', seek.pointerMove, false)
      containers.scene.addEventListener('pointerdown', drag.pointerDown, false)
      window.addEventListener('resize', debounce(1 / 60, viewport.resize), false)
      document.addEventListener('keydown', viewport.keyDown, false)
      document.addEventListener('keyup', viewport.keyUp, false)
      $electron.ipcRenderer.on('message', viewport.message)
      $electron.ipcRenderer.on('key-command', viewport.keyCommand)
      $electron.ipcRenderer.on('serialize-scene', view.serializeScene)
      $electron.ipcRenderer.on('deserialize-scene', view.deserializeScene)
    },

    initGeometry () {
      // logger.time('deserialize scene')
      // const initialState = route.deserializeGeometryFromLocalStorage()
      // logger.timeEnd('deserialize scene')
      // logger.log('initial state', initialState)
      const initialState = null
      if (initialState && initialState.segments.length) {
        geometry.createBaseFromState(initialState)
      } else {
        geometry.createBaseSegment()
      }
    },

    serializeScene () {
      logger.time('serialize scene')
      const data = io.serializeScene()
      logger.timeEnd('serialize scene')
      $electron.ipcRenderer.send('serialize-scene--response', data)
    },

    deserializeScene (event, data) {
      logger.time('deserialize scene')
      const json = JSON.parse(data)
      const scene = io.deserializeScene(json)
      logger.timeEnd('deserialize scene')
      logger.log('scene', scene)
      Object.keys(scene).forEach((key) => {
        Object.assign(state[key], scene[key])
      })
      state.simulation.isRunning = false
      view.updatePaletteState(null, null, state.controls)
    },

    update (tick) {
      this.syncStrokeWidthMod()
      if (state.simulation.isRunning) {
        state.simulation.tick++
        simulation.updateForces()
        state.simulation.system.tick(1)
        simulation.syncGeometry()
      }
      if (state.simulation.isRunning && !state.simulation.wasRunning) {
        this.sendGeometryState()
      }
      if (tick % TICK_MSG_INTERVAL === 0) {
        this.sendFrameState()
      }
      state.simulation.wasRunning = state.simulation.isRunning
    },

    syncStrokeWidthMod () {
      const value = geometry.computeModulatedStrokeWidth()
      this.updatePaletteState('lineTool', 'strokeWidthMod', value)
    },

    updatePaletteState (group, key, value) {
      $electron.ipcRenderer.send('palette-message', {
        type: 'UPDATE_STATE',
        group,
        key,
        value
      })
    },

    sendGeometryState () {
      const data = io.serializeMinimalGeometry()
      $electron.ipcRenderer.send('external-message', {
        type: 'SCENE',
        data
      })
    },

    sendFrameState () {
      const data = io.serializeFrame()
      $electron.ipcRenderer.send('external-message', {
        type: 'FRAME',
        data
      })
    },

    render (tick) {
      if (DISABLE_RENDER) return
      const { regl } = renderer

      state.renderer.drawCalls = 0
      state.renderer.fullScreenPasses = 0
      state.renderer.lineQuads = 0
      regl.poll()

      const shouldRender = view.updateRenderableGeometry(tick)
      if (shouldRender) view.renderScene(tick)

      state.viewport.didResize = false
    },

    // FEAT: Add user-controlled z-level per segment (maybe encode in alpha channel)
    updateRenderableGeometry (tick) {
      const { isRunning } = state.simulation
      const sceneContexts = scene.contexts
      const uiMain = sceneUI.main

      sceneContexts.forEach(({ lines }) => {
        lines.reset()
      })
      uiMain.lines.reset()

      drawSimulatorForceUI(state, sceneContexts[0].ctx, 0, 1)
      drawSimulatorForceUI(state, uiMain.ctx, 8, 1)
      drawSimulatorOriginUI(state, uiMain.ctx)

      if (isRunning) {
        drawOriginTick(state, uiMain.ctx)
      } else {
        drawOrigin(state, uiMain.ctx)
        drawGeometry(state, [uiMain], 0, 1)
      }

      drawGeometry(state, sceneContexts, 1)
      if (!isRunning && state.seek.index != null) {
        drawFocus(state, uiMain.ctx, state.seek.index)
      }

      let didResizeBuffer = false
      sceneContexts.forEach((context) => {
        if (context.lines.state.cursor.element > context.bufferSize) {
          const nextSize = context.bufferSize = context.bufferSize + 4096
          context.lines.resize(nextSize)
          didResizeBuffer = true
          logger.log('resize lines buffer', context.index, nextSize)
        }
      })

      return !didResizeBuffer
    },

    renderScene (tick) {
      const { postBuffers } = renderer
      const { setupDrawScreen, drawBoxBlur, drawScreen } = renderer.commands
      const { offset, scale, resolution, didResize } = state.viewport
      const { panOffset, zoomOffset } = state.drag
      const { isRunning } = state.simulation

      postBuffers.resize(resolution)
      const sceneBuffer = postBuffers.getWrite()
      const fxBuffer = postBuffers.getRead()

      sceneBuffer.use(() => {
        state.renderer.fullScreenPasses++
        // TODO: Tween between clear states
        view.renderClearRect(
          (isRunning ? 0.65 : 0.7),
          (didResize ? 1 : (isRunning ? 0.025 : 0.2)))
        cameras.scene.setup({
          offset: vec2.add(scratchVec2A, offset, panOffset),
          scale: scale + zoomOffset
        }, () => {
          view.renderLines()
          view.renderUI()
        })
      })

      setupDrawScreen(() => {
        fxBuffer.use(() => {
          state.renderer.drawCalls++
          state.renderer.fullScreenPasses++
          drawBoxBlur({
            color: sceneBuffer,
            resolution
          })
        })

        state.renderer.drawCalls++
        state.renderer.fullScreenPasses++
        drawScreen({
          color: sceneBuffer,
          bloom: fxBuffer,
          bloomIntensity: isRunning ? 0.4 : 0.3,
          noiseIntensity: isRunning ? 0.2 : 0.0,
          tick,
          resolution
        })
      })

      if (isRunning) postBuffers.swap()
    },

    // NOTE: Called once to setup non-dynamic UI
    renderOnce () {
      const uiGrid = sceneUI.grid
      drawPolarGrid(state, uiGrid.ctx)
    },

    renderClearRect (colorFactor, alpha) {
      const { drawRect } = renderer.commands
      state.renderer.drawCalls++
      drawRect({
        color: [
          0.6 * colorFactor,
          0.8 * colorFactor,
          0.84 * colorFactor,
          alpha
        ]
      })
    },

    computeLineThickness (baseThickness) {
      const { lineScaleFactor } = cameras.scene
      const { scale } = state.viewport
      const { zoomOffset } = state.drag
      return (baseThickness + 0.25) * lerp(1, scale + zoomOffset, lineScaleFactor)
    },

    shouldAdjustThickness () {
      return cameras.scene.shouldAdjustThickness
    },

    renderLines () {
      const { contexts } = scene
      const { isRunning } = state.simulation
      const { polarIterations } = state.controls.modifiers
      const { styles, textures, alphaTextures, alphaFunctions } = state.controls

      const model = mat4.identity(scratchMat4A)
      const polarAlpha = isRunning ? 1 : 0.025
      const polarStep = Math.PI * 2 / polarIterations
      const adjustProjectedThickness = this.shouldAdjustThickness()

      for (let i = contexts.length - 1; i >= 0; i--) {
        const { index, lines } = contexts[i]
        if (lines.state.cursor.vertex === 0) continue

        const style = styles[index]
        const {
          textureIndex, alphaTextureIndex, alphaFuncIndex,
          tintHex, tintAlpha, useScreenTintFunc
        } = style

        // OPTIM: Cache unchanged computed rgba array
        const tint = Colr.fromHex(tintHex)
          .toRgbArray()
          .map((v) => v / 255)
        tint.push(tintAlpha)

        const diffuseMap = textures[textureIndex || 0]
        const alphaMap = alphaTextures[alphaTextureIndex || 0]
        const alphaFunc = alphaFunctions[alphaFuncIndex || 0]
        const thickness = this.computeLineThickness(style.thickness)
        const miterLimit = this.computeLineThickness(4)

        const instances = range(polarIterations).map((index) => {
          return {
            angle: index * polarStep,
            angleAlpha: index === 0 ? 1 : polarAlpha,
            model,
            diffuseMap: diffuseMap.path,
            alphaMap: alphaMap.path,
            hatchAlpha: alphaFunc.hatchAlpha,
            tint,
            useScreenTintFunc,
            thickness,
            miterLimit,
            adjustProjectedThickness
          }
        })
        state.renderer.drawCalls += instances.length
        state.renderer.lineQuads += lines.state.cursor.quad
        lines.draw(instances)
      }
    },

    renderUI () {
      const { isRunning } = state.simulation
      const { contexts } = sceneUI
      const model = mat4.identity(scratchMat4A)
      const tint = [1, 1, 1, 1]
      const thickness = this.computeLineThickness(1)
      const miterLimit = this.computeLineThickness(4)
      const adjustProjectedThickness = this.shouldAdjustThickness()

      contexts.forEach(({ name, lines }) => {
        if (isRunning && name === 'grid') return
        state.renderer.drawCalls++
        state.renderer.lineQuads += lines.state.cursor.quad
        lines.draw({
          model,
          tint,
          thickness,
          miterLimit,
          adjustProjectedThickness
        })
      })
    }
  }

  tasks.add(view, 'update')
  tasks.add(view, 'render')
  view.inject()

  return {
    state
  }
}

export default {
  name: 'editor-compositor',

  data () {
    return {
      state: null
    }
  },

  mounted () {
    const { $el, $refs, $electron } = this
    const { state } = mountCompositor($el, $refs, $electron)
    this.state = state
  },

  components: {},
  methods: {}
}
</script>
