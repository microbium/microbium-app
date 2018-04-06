<template>
  <div class="editor-compositor">
    <div class="editor-compositor__scene" :class="sceneClassNames" ref="scene"></div>
    <!-- OPTIM: Investigate perf issues with stats rendering -->
    <div class="editor-compositor__stats" v-if="viewport && viewport.showStats">
      <div class="editor-compositor__stats__group">
        <div>resolution: {{ viewport.resolution[0] }}w
          {{ viewport.resolution[1] }}h
          ({{ viewport.pixelRatio }}x)</div>
      </div>
      <div class="editor-compositor__stats__group">
        <div>pin constraints: {{ simulation.pinConstraintCount || '-' }}</div>
        <div>local constraints: {{ simulation.localConstraintCount || '-' }}</div>
        <div>forces: {{ simulation.forcesCount || '-' }}</div>
      </div>
      <div class="editor-compositor__stats__group">
        <div>vertices: {{ renderer.verticesCount }}</div>
        <div>line segments: {{ renderer.segmentsCount }}</div>
      </div>
      <div class="editor-compositor__stats__group">
        <div>line quads: {{ renderer.lineQuads }}</div>
        <div>draw calls: {{ renderer.drawCalls }}</div>
        <div>full screen passes: {{ renderer.fullScreenPasses }}</div>
      </div>
      <div class="editor-compositor__stats__group" v-if="DEBUG_PERF">
        <div>update physics: {{ timer.get('updatePhysics', 6) }} ms</div>
        <div>update lines: {{ timer.get('updateLines', 6) }} ms</div>
        <div>render lines: {{ timer.get('renderLines', 6) }} ms</div>
        <div>render bloom: {{ timer.get('renderBloom', 6) }} ms</div>
        <div>render banding: {{ timer.get('renderBanding', 6) }} ms</div>
        <div>render edges: {{ timer.get('renderEdges', 6) }} ms</div>
        <div>render composite: {{ timer.get('renderComposite', 6) }} ms</div>
      </div>
      <div class="editor-compositor__stats__group" v-if="DEBUG_RENDER_HASH">
        <div>hash: {{ renderer.lastRenderHash }}</div>
      </div>
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

    > canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &.mode--simulate { cursor: none; }
    &.mode--edit { cursor: none; }
    &.navigate--will-pan { cursor: -webkit-grab; }
    &.navigate--pan { cursor: -webkit-grabbing; }
    &.navigate--will-zoom { cursor: -webkit-zoom-in; }
    &.navigate--zoom { cursor: -webkit-zoom-in; }
  }

  &__stats {
    position: absolute;
    bottom: 14px;
    left: 14px;

    color: #444;
    font: 10px/1.2 Monaco, monospace;
    pointer-events: none;

    &__group {
      &:after {
        content: "";
        position: relative;
        display: block;
        border: none;
        border-top: 2px solid rgba(#fff, 0.2);
        margin: 6px 0;
        width: 20px;
      }
    }
  }
}
</style>

<script>
import { vec2, vec3, mat4 } from 'gl-matrix'
import createREGL from 'regl'
import Colr from 'colr'

// import { TEXTURES } from '@src/constants/line-styles'

import { createTaskManager } from '@src/utils/task'
import { createLoop } from '@src/utils/loop'
import { createPostBuffers } from '@src/utils/fbo'
import { debounce } from '@src/utils/function'
import { range } from '@src/utils/array'
import { lerp } from '@src/utils/math'
import { logger } from '@src/utils/logger'
import { timer } from '@src/utils/timer'

// import { createTextureManager } from '@src/utils/texture'
import {
  createDrawBanding,
  createDrawEdges,
  createDrawGaussBlur,
  createDrawRect,
  createDrawScreen,
  createDrawTexture,
  createSetupDrawScreen
} from '@src/draw/commands/screen-space'
import {
  createCompositorState,
  hashRenderState
} from '@src/store/modules/Editor'

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
} from '@src/draw/routines/simulation'
import {
  drawOrigin,
  drawOriginTick,
  drawPolarGrid
} from '@src/draw/routines/origin'
import {
  drawGeometry,
  drawFocus,
  drawFocusProximate
} from '@src/draw/routines/geometry'

const TICK_MSG_INTERVAL = 20
const DISABLE_FRAME_SYNC = true
const DISABLE_RENDER = false
const DEBUG_RENDER_HASH = false
const DEBUG_PERF = false

const scratchVec2A = vec2.create()
const scratchVec3A = vec3.create()
const scratchMat4A = mat4.create()

// Move state / syncing to Editor
function mountCompositor ($el, $refs, actions) {
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
    const canvas = document.createElement('canvas')
    const regl = createREGL({
      canvas,
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

    // const textures = createTextureManager(regl, TEXTURES)
    const postBuffers = createPostBuffers(regl,
      'full', 'banding', 'edges', 'blurA', 'blurB')
    const commands = {
      setupDrawScreen: createSetupDrawScreen(regl),
      drawBanding: createDrawBanding(regl),
      drawEdges: createDrawEdges(regl),
      drawScreen: createDrawScreen(regl),
      drawGaussBlur: createDrawGaussBlur(regl),
      drawRect: createDrawRect(regl),
      drawTexture: createDrawTexture(regl)
    }

    tasks.defer((containers) => {
      containers.scene.appendChild(canvas)
      return Promise.resolve()
    }, 'inject')

    tasks.add((event) => {
      const { resolution } = state.viewport
      canvas.width = resolution[0]
      canvas.height = resolution[1]
    }, 'resize')

    return {
      regl,
      canvas,
      // textures,
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
        viewport.resize()
        view.bindEvents()
        view.willStart()
        view.start()
        view.didStart()
      })
    },

    willStart () {
      actions.sendMessage('main-will-start')
    },

    start () {
      // tasks.run('syncState')
      view.renderOnce()
      loop.start()
    },

    didStart () {
      actions.sendMessage('main-did-start')
    },

    bindEvents () {
      containers.scene.addEventListener('pointermove', seek.pointerMove, false)
      containers.scene.addEventListener('pointerdown', drag.pointerDown, false)

      window.addEventListener('resize', debounce(120, viewport.resize), false)
      window.addEventListener('wheel', viewport.wheel, false)
      document.addEventListener('keydown', viewport.keyDown, false)
      document.addEventListener('keyup', viewport.keyUp, false)

      actions.observeMessage('message', (event, data) => viewport.message(data))
      actions.observeMessage('command', (event, data) => viewport.command(data))
      actions.observeMessage('serialize-scene', (event, data) => view.serializeScene())
      actions.observeMessage('deserialize-scene', (event, data) => view.deserializeScene(data))
    },

    serializeScene () {
      logger.time('serialize scene')
      const data = io.serializeScene()
      logger.timeEnd('serialize scene')
      actions.sendMessage('serialize-scene--response', data)
    },

    deserializeScene (data) {
      const wasRunning = state.simulation.isRunning

      logger.time('deserialize scene')
      const json = JSON.parse(data)
      const scene = io.deserializeScene(json)
      logger.timeEnd('deserialize scene')
      logger.log('scene', scene)

      // Pause & destroy simulation state
      if (wasRunning) simulation.toggle()

      Object.keys(scene).forEach((key) => {
        Object.assign(state[key], scene[key])
      })

      state.renderer.needsUpdate = true
      view.updatePaletteState(null, null, state.controls)

      // Restart simulation
      if (wasRunning) simulation.toggle()
    },

    update (tick) {
      const { isRunning, wasRunning, isPaused } = state.simulation
      timer.reset()
      if (!isRunning) {
        this.syncStrokeWidthMod()
        this.syncCursor(true)
      }
      if (isRunning && !wasRunning) {
        this.syncCursor(false)
      }
      if (isRunning && !isPaused) {
        timer.begin('updatePhysics')
        state.simulation.tick++
        simulation.update(tick)
        timer.end('updatePhysics')
      }
      if (isRunning && !wasRunning) {
        this.sendGeometryState()
      }
      if (tick % TICK_MSG_INTERVAL === 0) {
        this.sendFrameState()
      }
      state.simulation.wasRunning = isRunning
    },

    syncStrokeWidthMod () {
      const stateControls = state.controls
      const value = geometry.computeModulatedStrokeWidth()

      geometry.updateActiveSegmentStrokeWidthMod(value)
      stateControls.lineTool.strokeWidthMod = value
      this.updatePaletteState('lineTool', 'strokeWidthMod', value)
    },

    syncCursor (shouldShow) {
      const { shouldNavigate } = state.drag
      const isActive = shouldShow && !shouldNavigate
      if (!isActive) return actions.updateCursor(false)

      const { screen, index } = state.seek
      const { lineTool, constraintGroups } = state.controls
      const { strokeWidth, strokeWidthMod, constraintIndex } = lineTool
      const constraintType = constraintGroups[constraintIndex].typeIndex

      actions.updateCursor(shouldShow && !shouldNavigate, {
        seekPosition: screen,
        seekIndex: index,
        strokeWidth,
        strokeWidthMod,
        constraintType
      })
    },

    updatePaletteState (group, key, value) {
      actions.sendMessage('palette-message', {
        type: 'UPDATE_CONTROLS',
        group,
        key,
        value
      })
    },

    sendGeometryState () {
      const data = io.serializeMinimalGeometry()
      actions.sendMessage('external-message', {
        type: 'SCENE',
        data
      })
    },

    sendFrameState () {
      if (DISABLE_FRAME_SYNC) return
      const data = io.serializeFrame()
      actions.sendMessage('external-message', {
        type: 'FRAME',
        data
      })
    },

    render (tick) {
      if (DISABLE_RENDER) return
      const { regl } = renderer
      const stateGeometry = state.geometry
      const stateRenderer = state.renderer
      const nextRenderHash = hashRenderState(state)

      stateRenderer.drawCalls = 0
      stateRenderer.fullScreenPasses = 0
      stateRenderer.lineQuads = 0
      stateRenderer.verticesCount = stateGeometry.vertices.length
      stateRenderer.segmentsCount = stateGeometry.segments.length
      regl.poll()

      timer.begin('updateLines')
      const shouldUpdate = nextRenderHash !== stateRenderer.lastRenderHash ||
        stateRenderer.needsUpdate
      const shouldRender = (shouldUpdate || stateRenderer.updateOverlapTick-- > 0) &&
        view.updateRenderableGeometry(tick)
      timer.end('updateLines')

      if (shouldRender) view.renderScene(tick)
      if (shouldUpdate) stateRenderer.updateOverlapTick = 20

      stateRenderer.lastRenderHash = nextRenderHash
      stateRenderer.needsUpdate = false
      state.viewport.didResize = false
    },

    // FEAT: Add user-controlled z-level per segment (maybe encode in alpha channel)
    updateRenderableGeometry (tick) {
      const { isRunning } = state.simulation
      const { styles } = state.controls
      const uiMain = sceneUI.main
      const sceneContexts = scene.syncContexts(styles)

      sceneContexts.forEach(({ lines }) => {
        lines.reset()
      })
      uiMain.lines.reset()

      // TODO: Enable drawing force positions while editing
      if (isRunning) {
        drawSimulatorForceUI(state, sceneContexts[0].ctx, 3, 0.4)
        drawSimulatorForceUI(state, uiMain.ctx, 8, 1)
        drawSimulatorOriginUI(state, uiMain.ctx)
      }

      if (isRunning) {
        drawOriginTick(state, uiMain.ctx)
      } else {
        drawOrigin(state, uiMain.ctx)
      }

      drawGeometry(state, sceneContexts, 0)
      if (!isRunning && state.seek.index != null) {
        drawFocus(state, uiMain.ctx, state.seek.index)
      }
      if (!isRunning && state.seek.proximateIndices.length) {
        drawFocusProximate(state, uiMain.ctx,
          state.seek.proximateIndices, state.seek.index)
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

    // TODO: Break up post-processing passes
    renderScene (tick) {
      const { postBuffers } = renderer
      const {
        setupDrawScreen, drawRect, drawTexture,
        drawBanding, drawEdges, drawScreen
      } = renderer.commands
      const {
        offset, scale, resolution,
        pixelRatio, pixelRatioNative, didResize
      } = state.viewport
      const { panOffset, zoomOffset } = state.drag
      const { isRunning } = state.simulation
      const { postEffects } = state.controls

      const viewResolution = vec3.set(scratchVec3A,
        resolution[0], resolution[1], pixelRatio)
      const viewOffset = vec2.add(scratchVec2A, offset, panOffset)
      const viewScale = scale + zoomOffset

      const { banding, edges, bloom, noise, colorShift } = postEffects
      const shouldRenderBloom = isRunning &&
        bloom.blurPasses > 0 && bloom.intensityFactor > 0
      const shouldRenderBanding = isRunning &&
        banding.intensityFactor > 0
      const shouldRenderEdges = isRunning

      postBuffers.resize('full', resolution)
      postBuffers.resize('banding', resolution, banding.bufferScale / pixelRatioNative)
      postBuffers.resize('edges', resolution, edges.bufferScale / pixelRatioNative)
      postBuffers.resize('blurA', resolution, bloom.bufferScale / (pixelRatioNative * 2))
      postBuffers.resize('blurB', resolution, bloom.bufferScale / (pixelRatioNative * 2))

      timer.begin('renderLines')
      postBuffers.get('full').use(() => {
        // TODO: Tween between clear states
        const clearColor = Colr.fromHex(postEffects.clear.colorHex)
          .toRgbArray()
          .map((v) => v / 255)
        clearColor.push(didResize ? 1
          : (!isRunning ? 0.6
            : (0.025 * postEffects.clear.alphaFactor)))

        state.renderer.drawCalls++
        drawRect({
          color: clearColor
        })

        cameras.scene.setup({
          viewResolution,
          viewOffset,
          viewScale
        }, () => {
          view.renderLines()
          // view.renderUI()
        })
      })
      timer.end('renderLines')

      setupDrawScreen(() => {
        const bloomIntensity = !shouldRenderBloom ? 0
          : (0.4 * bloom.intensityFactor)
        const noiseIntensity = !isRunning ? 0.0
          : (0.06 * noise.intensityFactor)
        const bandingIntensity = !shouldRenderBanding ? 0
          : (0.6 * banding.intensityFactor)
        const edgesIntensity = !shouldRenderEdges ? 0
          : (0.25 * edges.intensityFactor)

        // Bloom
        timer.begin('renderBloom')
        if (shouldRenderBloom) {
          view.renderSceneBlurPasses(viewResolution,
            bloom.blurStep, bloom.blurPasses)
        }
        timer.end('renderBloom')

        // Banding
        timer.begin('renderBanding')
        if (shouldRenderBanding) {
          state.renderer.drawCalls++
          state.renderer.fullScreenPasses++
          postBuffers.get('banding').use(() => {
            drawBanding({
              color: postBuffers.get('full'),
              bandingStep: banding.bandStep,
              tick
            })
          })
        }
        timer.end('renderBanding')

        // Edges
        timer.begin('renderEdges')
        if (shouldRenderEdges) {
          state.renderer.drawCalls++
          state.renderer.fullScreenPasses++
          postBuffers.get('edges').use(() => {
            drawEdges({
              color: postBuffers.get(shouldRenderBanding ? 'banding' : 'full'),
              thickness: edges.thickness,
              tick,
              viewResolution
            })
          })
        }
        timer.end('renderEdges')

        // Post FX Composite
        timer.begin('renderComposite')
        state.renderer.drawCalls++
        state.renderer.fullScreenPasses++
        drawScreen({
          color: postBuffers.get('full'),
          colorShift,
          bloom: postBuffers.get(shouldRenderBloom ? 'blurB' : 'blank'),
          bloomIntensity,
          banding: postBuffers.get(shouldRenderBanding ? 'banding' : 'blank'),
          bandingIntensity,
          edges: postBuffers.get(shouldRenderBanding ? 'edges' : 'blank'),
          edgesIntensity,
          noiseIntensity,
          tick,
          viewOffset,
          viewResolution
        })
        timer.end('renderComposite')

        // Bloom Feedback
        if (isRunning && shouldRenderBloom) {
          postBuffers.get('full').use(() => {
            drawTexture({
              color: postBuffers.get('blurB')
            })
          })
        }
      })

      // UI Overlay
      cameras.scene.setup({
        viewResolution,
        viewOffset,
        viewScale
      }, () => {
        view.renderUI()
      })
    },

    renderSceneBlurPasses (viewResolution, radiusStep, count) {
      const { postBuffers } = renderer
      const { drawGaussBlur } = renderer.commands

      for (let i = 0; i < count * 2; i++) {
        postBuffers.swap('blurB', 'blurA')
        postBuffers.get('blurB').use(() => {
          const radius = (1 + Math.floor(i / 2)) * radiusStep
          const blurDirection = (i % 2 === 0)
            ? [radius, 0]
            : [0, radius]

          state.renderer.drawCalls++
          state.renderer.fullScreenPasses++
          drawGaussBlur({
            color: postBuffers.get(i === 0 ? 'full' : 'blurA'),
            blurDirection,
            viewResolution
          })
        })
      }
    },

    // NOTE: Called once to setup non-dynamic UI
    renderOnce () {
      const uiGrid = sceneUI.grid
      drawPolarGrid(state, uiGrid.ctx)
    },

    computeLineThickness (baseThickness) {
      const { lineScaleFactor } = cameras.scene
      const { scale, pixelRatio } = state.viewport
      const { zoomOffset } = state.drag
      const pixelRatioAdjust = 0.5 / pixelRatio
      return (baseThickness + pixelRatioAdjust) *
        lerp(1, scale + zoomOffset, lineScaleFactor)
    },

    shouldAdjustThickness () {
      return cameras.scene.shouldAdjustThickness
    },

    renderLines () {
      const { contexts } = scene
      const { isRunning, tick } = state.simulation
      const { polarIterations } = state.controls.modifiers
      const { styles, alphaFunctions } = state.controls

      const model = mat4.identity(scratchMat4A)
      const polarAlpha = isRunning ? 1 : 0.025
      const polarStep = Math.PI * 2 / polarIterations
      const adjustProjectedThickness = this.shouldAdjustThickness()

      for (let i = contexts.length - 1; i >= 0; i--) {
        const { index, lines } = contexts[i]
        if (lines.state.cursor.vertex === 0) continue

        const style = styles[index]
        const { alphaFuncIndex, tintHex, tintAlpha } = style

        // OPTIM: Cache unchanged computed rgba array
        const tint = Colr.fromHex(tintHex)
          .toRgbArray()
          .map((v) => v / 255)
        tint.push(tintAlpha)

        const alphaFunc = alphaFunctions[alphaFuncIndex || 0]
        const thickness = this.computeLineThickness(style.thickness)
        const miterLimit = this.computeLineThickness(4)

        const instances = range(polarIterations).map((index) => {
          return {
            angle: index * polarStep,
            angleAlpha: index === 0 ? 1 : polarAlpha,
            tick,
            model,
            dashFunction: alphaFunc.dashFunction,
            tint,
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

  props: {
    observeMessage: Function,
    sendMessage: Function,
    updateCursor: Function
  },

  components: {},

  data () {
    return {
      DEBUG_RENDER_HASH,
      DEBUG_PERF,
      timer,
      drag: null,
      renderer: null,
      simulation: null,
      viewport: null
    }
  },

  mounted () {
    const { $el, $refs } = this
    const actions = {
      observeMessage: this.observeMessage,
      sendMessage: this.sendMessage,
      updateCursor: this.updateCursor
    }
    const { state } = mountCompositor($el, $refs, actions)

    timer.enable(DEBUG_PERF)

    this.drag = state.drag
    this.renderer = state.renderer
    this.simulation = state.simulation
    this.viewport = state.viewport
  },

  computed: {
    sceneClassNames () {
      const { simulation, drag } = this
      if (!(drag || simulation)) return

      return {
        'mode--edit': !simulation.isRunning,
        'mode--simulate': simulation.isRunning && !simulation.isPaused,
        'navigate--will-pan': drag.shouldNavigate && !drag.shouldZoom,
        'navigate--pan': drag.isPanning,
        'navigate--will-zoom': drag.shouldNavigate && drag.shouldZoom && !drag.isPanning,
        'navigate--zoom': drag.isZooming
      }
    }
  }
}
</script>
