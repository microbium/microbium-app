import { vec2, vec3, vec4, mat4 } from 'gl-matrix'
import Colr from 'colr'

import { createTaskManager } from '@renderer/utils/task'
import { createLoop } from '@renderer/utils/loop'
import { debounce } from '@renderer/utils/function'
import { range } from '@renderer/utils/array'
import { lerp, radialPosition } from '@renderer/utils/math'
import { clampPixelRatio } from '@renderer/utils/screen'
import { logger } from '@renderer/utils/logger'
import { timer } from '@renderer/utils/timer'

import {
  createCompositorState,
  hashRenderState
} from '@renderer/store/modules/Editor'

import { createRenderer } from './renderer'
import { createCameras } from './cameras'
import { createScene, createUIScene } from './scenes'
import { createGeometryController } from './geometry'
import { createSimulationController } from './simulation'
import { createSeekController, createDragController } from './interaction'
import { createViewportController } from './viewport'
import { createIOController } from './io'

import {
  drawSimulatorForces,
  drawSimulatorForcesTick,
  drawSimulatorPointerForces
} from '@renderer/draw/routines/simulation'
import {
  drawOrigin,
  drawOriginTick,
  drawPolarGrid
} from '@renderer/draw/routines/origin'
import {
  drawGeometry,
  drawFocus,
  drawFocusProximate
} from '@renderer/draw/routines/geometry'

const TICK_MSG_INTERVAL = 20
const DISABLE_FRAME_SYNC = true
const DISABLE_RENDER = false

const scratchVec2A = vec2.create()
const scratchVec3A = vec3.create()
const scratchVec4A = vec4.create()
const scratchMat4A = mat4.create()

// Move state / syncing to Editor
export function mountCompositor ($el, $refs, actions) {
  const containers = {
    scene: $refs.scene
  }

  const tasks = createTaskManager(
    'inject', 'syncState',
    'update', 'render', 'resize')
  const loop = createAnimationLoop()
  const state = createCompositorState()

  const renderer = createRenderer(tasks, state)
  const cameras = createCameras(tasks, state, renderer)
  const scene = createScene(tasks, state, renderer)
  const sceneAltUI = createScene(tasks, state, renderer)
  const sceneUI = createUIScene(tasks, state, renderer)

  const geometry = createGeometryController(tasks, state)
  const simulation = createSimulationController(tasks, state)
  const seek = createSeekController(tasks, state)
  const drag = createDragController(tasks, state)
  const viewport = createViewportController(tasks, state)
  const io = createIOController(tasks, state)

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
        view.createComputedState()
        view.bindEvents()
        view.willStart()
        view.start()
        view.didStart()
      })
    },

    createComputedState () {
      this.computedState = {
        viewResolution: vec3.create(),
        viewOffset: vec2.create(),
        viewScale: 1,
        colorShift: vec3.create(),
        shouldRenderBloom: false,
        shouldRenderBanding: false,
        shouldRenderEdges: false,
        bloomIntensity: 0,
        noiseIntensity: 0,
        bandingIntensity: 0,
        edgesIntensity: 0,
        vignetteParams: vec3.create(),
        lutIntensity: 0,
        forcePositions: []
      }
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

      actions.observeMessage('message', (event, data) => viewport.handleMessage(data))
      actions.observeMessage('command', (event, data) => viewport.handleCommand(data))
      actions.observeMessage('serialize-scene', (event, data) => view.serializeScene())
      actions.observeMessage('deserialize-scene', (event, data) => view.deserializeScene(data))
      actions.observeMessage('save-frame', (event, data) => view.saveFrameData(data))
    },

    serializeScene () {
      logger.time('serialize scene')
      const data = io.serializeScene()
      logger.timeEnd('serialize scene')
      actions.sendMessage('serialize-scene--response', data)
    },

    // FIXME: Issue with `postEffects.lut.textureFile`
    // not always getting set to `state` when available in `scene`
    // seems to only happen in dev live-reload
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
      this.updatePaletteState(null, null, state.controls, true)

      // Restart simulation
      if (wasRunning) simulation.toggle()
    },

    saveFrameData ({ path }) {
      logger.time('save frame data')
      const { regl, postBuffers } = renderer
      const { resolution } = state.viewport
      const width = resolution[0]
      const height = resolution[1]

      postBuffers.resize('fullExport', resolution)
      this.renderScene(0, postBuffers.get('fullExport'))

      const buffer = new Uint8Array(width * height * 4)
      postBuffers.get('fullExport').use(() => {
        regl.read({
          x: 0,
          y: 0,
          width,
          height,
          data: buffer
        })
      })

      actions.sendMessage('save-frame--response', {
        path,
        buffer,
        width,
        height
      })
      logger.timeEnd('save frame data')
    },

    // Update
    // ..................................................

    update (tick) {
      const { isRunning, wasRunning, isPaused } = state.simulation
      const { speed } = state.controls.simulation

      timer.reset()
      this.updateComputedPosition()
      this.updateComputedForcePositions()
      this.updateComputedPostState()

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
        simulation.update(tick, speed)
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

    updateComputedPosition () {
      const { computedState } = this
      const { offset, scale, resolution } = state.viewport
      const { pixelRatio } = state.controls.viewport
      const { panOffset, zoomOffset } = state.drag
      const { viewResolution, viewOffset } = computedState

      vec3.set(viewResolution,
        resolution[0], resolution[1], pixelRatio)
      vec2.add(viewOffset, offset, panOffset)
      computedState.viewScale = scale + zoomOffset
    },

    updateComputedForcePositions () {
      const { computedState } = this
      const { forces } = state.controls

      computedState.forcePositions = forces
        .filter((force) => force.positionTypeIndex === 0)
        .map(({ polarOffset, polarAngle, radius }) => {
          const offset = vec2.set(scratchVec2A, polarOffset * polarOffset, 0)
          const position = radialPosition([], offset, polarAngle / 180 * Math.PI)
          position[2] = radius * radius
          return position
        })
    },

    updateComputedPostState () {
      const { computedState } = this
      const { isRunning } = state.simulation
      const { postEffects } = state.controls
      const { bloom, banding, edges, lut, vignette, colorShift, noise } = postEffects

      const shouldRenderBloom = computedState.shouldRenderBloom = isRunning &&
        bloom.enabled && bloom.blurPasses > 0 && bloom.intensityFactor > 0
      const shouldRenderBanding = computedState.shouldRenderBanding = isRunning &&
        banding.enabled && banding.intensityFactor > 0
      const shouldRenderEdges = computedState.shouldRenderEdges = isRunning && edges.enabled
      const shouldRenderLut = isRunning && lut.enabled && !!lut.textureFile

      computedState.bloomIntensity = !shouldRenderBloom ? 0
        : (0.4 * bloom.intensityFactor)
      computedState.noiseIntensity = !isRunning || !noise.enabled ? 0.0
        : (0.06 * noise.intensityFactor)
      computedState.bandingIntensity = !shouldRenderBanding ? 0
        : (0.6 * banding.intensityFactor)
      computedState.edgesIntensity = !shouldRenderEdges ? 0
        : (0.25 * edges.intensityFactor)
      computedState.lutIntensity = !shouldRenderLut ? 0 : lut.intensityFactor

      vec3.set(computedState.vignetteParams,
        vignette.radius, vignette.smoothness,
        vignette.enabled ? vignette.intensityFactor : 0)

      computedState.colorShift = colorShift.enabled ? colorShift.hsl : colorShift.none
    },

    // OPTIM: Improve syncing
    syncStrokeWidthMod () {
      const stateControls = state.controls
      const value = geometry.computeModulatedStrokeWidth()

      if (value !== this._computedModulatedStrokeWidth) {
        geometry.updateActiveSegmentStrokeWidthMod(value)
        stateControls.lineTool.strokeWidthMod = value
        this.updatePaletteState('lineTool', 'strokeWidthMod', value)
        this._computedModulatedStrokeWidth = value
      }
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

    updatePaletteState (group, key, value, toMenu = false) {
      const channel = toMenu ? 'palette+menu-message' : 'palette-message'
      actions.sendMessage(channel, {
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

    // Render
    // ..................................................

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
        this.updateRenderableGeometry(tick)
      timer.end('updateLines')

      if (shouldRender) this.renderScene(tick)
      if (shouldUpdate) stateRenderer.updateOverlapTick = 20

      stateRenderer.lastRenderHash = nextRenderHash
      stateRenderer.needsUpdate = false
      state.viewport.didResize = false
    },

    // NOTE: Called once to setup non-dynamic UI
    renderOnce () {
      const uiGrid = sceneUI.grid
      drawPolarGrid(state, uiGrid.ctx)
    },

    // FEAT: Add user-controlled z-level per segment (maybe encode in alpha channel)
    updateRenderableGeometry (tick) {
      const { isRunning } = state.simulation
      const { styles, stylesUI } = state.controls
      const uiMain = sceneUI.main
      const sceneContexts = scene.syncContexts(styles)
      const sceneUIContexts = sceneAltUI.syncContexts(stylesUI)

      sceneContexts.forEach(({ lines }) => {
        lines.reset()
      })
      sceneUIContexts.forEach(({ lines }) => {
        lines.reset()
      })
      uiMain.lines.reset()

      drawOrigin(state, uiMain.ctx)
      drawSimulatorForces(state, sceneUIContexts[0].ctx, 8, 1)

      if (isRunning) {
        drawOriginTick(state, uiMain.ctx)
        drawSimulatorForcesTick(state, uiMain.ctx, 8, 1)
        drawSimulatorPointerForces(state, sceneUIContexts[0].ctx, 4, 1)
        drawSimulatorPointerForces(state, sceneContexts[0].ctx, 4, 0.15)
        drawSimulatorForces(state, sceneContexts[0].ctx, 10, 0.05)
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

    // TODO: Make buffer scaling relative to hardware perf rather than device's pixel ratio
    // OPTIM: Investigate resize perf regression after Electron upgrade
    resizeRenderBuffers () {
      const { postBuffers } = renderer
      const { resolution, resolutionMax, pixelRatioNative } = state.viewport
      const { postEffects } = state.controls
      const { banding, edges, bloom } = postEffects

      const maxDimension = resolutionMax[0]
      let bufPixelRatio = 1
      postBuffers.resize('full', resolution)

      bufPixelRatio = banding.bufferScale / pixelRatioNative
      postBuffers.resize('banding', resolution,
        clampPixelRatio(resolution, bufPixelRatio, maxDimension))

      bufPixelRatio = edges.bufferScale / pixelRatioNative
      postBuffers.resize('edges', resolution,
        clampPixelRatio(resolution, bufPixelRatio, maxDimension))

      bufPixelRatio = bloom.bufferScale / pixelRatioNative
      postBuffers.resize('blurA', resolution,
        clampPixelRatio(resolution, bufPixelRatio, maxDimension))
      postBuffers.resize('blurB', resolution,
        clampPixelRatio(resolution, bufPixelRatio, maxDimension))
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

    // TODO: Ensure line thickness is correct on high dpi
    computeLineThickness (baseThickness) {
      const { lineScaleFactor } = cameras.scene
      const { scale } = state.viewport
      const { pixelRatio } = state.controls.viewport
      const { zoomOffset } = state.drag
      const pixelRatioAdjust = 0.5 / pixelRatio
      return (baseThickness + pixelRatioAdjust) *
        lerp(1, scale + zoomOffset, lineScaleFactor)
    },

    shouldAdjustThickness () {
      return cameras.scene.shouldAdjustThickness
    },

    renderLines ({ contexts }, { polarAlpha, renderMirror }) {
      const { tick, isRunning } = state.simulation
      const { polarIterations, mirror } = state.controls.modifiers
      const { styles, alphaFunctions } = state.controls

      const model = mat4.identity(scratchMat4A)
      const polarStep = Math.PI * 2 / polarIterations
      const mirrorAlpha = mirror.intensityFactor * (isRunning ? 1 : 0.2)
      const adjustProjectedThickness = this.shouldAdjustThickness()

      const angles = range(polarIterations)
        .map((i) => i * polarStep)
      const anglesAlpha = range(polarIterations)
        .map((i) => (i === 0 ? 1 : polarAlpha))

      for (let i = contexts.length - 1; i >= 0; i--) {
        const { index, lines } = contexts[i]
        if (lines.state.cursor.vertex === 0) continue

        const style = styles[index]
        const { lineAlphaFuncIndex, fillAlphaFuncIndex, tintHex, tintAlpha } = style

        // OPTIM: Cache unchanged computed rgba array
        const tint = Colr.fromHex(tintHex)
          .toRgbArray()
          .map((v) => v / 255)
        tint.push(tintAlpha)

        const lineAlphaFunc = alphaFunctions.all[lineAlphaFuncIndex || 0]
        const fillAlphaFunc = alphaFunctions.all[fillAlphaFuncIndex || 0]
        const thickness = this.computeLineThickness(style.thickness)
        const miterLimit = this.computeLineThickness(4)

        const mirror = vec3.set(scratchVec3A, 1, 1, 1)

        const params = {
          mirror,
          angles,
          anglesAlpha,
          tick,
          model,
          lineDashFunction: lineAlphaFunc.dashFunction,
          fillDashFunction: fillAlphaFunc.dashFunction,
          tint,
          thickness,
          miterLimit,
          adjustProjectedThickness
        }

        state.renderer.lineQuads += lines.state.cursor.quad

        state.renderer.drawCalls += 1
        lines.draw(params)

        if (renderMirror) {
          state.renderer.drawCalls += 1
          params.mirror = vec3.set(mirror, -1, 1, mirrorAlpha)
          lines.draw(params)
        }
      }
    },

    renderUI ({ contexts }) {
      const { isRunning } = state.simulation
      const { overlay } = state.controls.viewport

      const model = mat4.identity(scratchMat4A)
      const tint = vec4.set(scratchVec4A, 1, 1, 1, overlay.alphaFactor)
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
    },

    // Render Scene
    // ..................................................

    renderScene (tick, fbo = null) {
      const { setupDrawScreen } = renderer.commands

      this.resizeRenderBuffers()
      this.renderSceneMain()

      setupDrawScreen(() => {
        this.renderSceneBloom(tick)
        this.renderSceneBanding(tick)
        this.renderSceneEdges(tick)
        this.renderSceneComposite(tick, fbo)
        this.renderSceneBloomFeedback(tick)
      })

      this.renderSceneUI()
    },

    renderSceneMain () {
      const { postBuffers } = renderer
      const { drawRect } = renderer.commands
      const { isRunning } = state.simulation
      const { didResize } = state.viewport
      const { background } = state.controls.viewport
      const { viewResolution, viewOffset, viewScale } = this.computedState

      timer.begin('renderLines')
      postBuffers.get('full').use(() => {
        // TODO: Tween between clear states
        const clearColor = Colr.fromHex(background.colorHex)
          .toRgbArray()
          .map((v) => v / 255)
        clearColor.push(didResize ? 1
          : (!isRunning ? 0.6
            : (0.025 * background.alphaFactor)))

        state.renderer.drawCalls++
        drawRect({
          color: clearColor
        })

        cameras.scene.setup({
          viewResolution,
          viewOffset,
          viewScale
        }, () => {
          this.renderLines(scene, {
            polarAlpha: isRunning ? 1 : 0.025,
            renderMirror: true
          })
        })
      })
      timer.end('renderLines')
    },

    renderSceneBloom () {
      const { viewResolution, shouldRenderBloom } = this.computedState
      const { bloom } = state.controls.postEffects

      timer.begin('renderBloom')
      if (shouldRenderBloom) {
        this.renderSceneBlurPasses(viewResolution,
          bloom.blurStep, bloom.blurPasses)
      }
      timer.end('renderBloom')
    },

    renderSceneBanding (tick) {
      const { postBuffers } = renderer
      const { drawBanding } = renderer.commands
      const { banding } = state.controls.postEffects
      const { shouldRenderBanding } = this.computedState

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
    },

    // OPTIM: Research more performant methods for rendering edges
    renderSceneEdges (tick) {
      const { postBuffers } = renderer
      const { drawEdges } = renderer.commands
      const { edges } = state.controls.postEffects
      const { shouldRenderBanding, shouldRenderEdges, viewResolution } = this.computedState

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
    },

    renderSceneComposite (tick, fbo) {
      const { postBuffers, textures } = renderer
      const { drawScreen } = renderer.commands
      const { overlay } = state.controls.viewport
      const { lut } = state.controls.postEffects
      const {
        viewResolution, viewOffset, viewScale, forcePositions,
        shouldRenderBloom, shouldRenderBanding,
        bloomIntensity, bandingIntensity, edgesIntensity, lutIntensity,
        vignetteParams, colorShift, noiseIntensity
      } = this.computedState

      timer.begin('renderComposite')

      state.renderer.drawCalls++
      state.renderer.fullScreenPasses++

      const compositeParams = {
        color: postBuffers.get('full'),
        colorShift,
        bloom: postBuffers.get(shouldRenderBloom ? 'blurB' : 'blank'),
        bloomIntensity,
        banding: postBuffers.get(shouldRenderBanding ? 'banding' : 'blank'),
        bandingIntensity,
        edges: postBuffers.get(shouldRenderBanding ? 'edges' : 'blank'),
        edgesIntensity,
        noiseIntensity,
        lutIntensity,
        lutTexture: textures.get('lut', lut.textureFile && lut.textureFile.path),
        overlayAlpha: overlay.alphaFactor,
        vignetteParams,
        tick,
        viewOffset,
        viewResolution,
        viewScale,
        forcePositions
      }

      if (fbo) fbo.use(() => drawScreen(compositeParams))
      else drawScreen(compositeParams)

      timer.end('renderComposite')
    },

    renderSceneBloomFeedback () {
      const { postBuffers } = renderer
      const { drawTexture } = renderer.commands
      const { isRunning } = state.simulation
      const { bloom } = state.controls.postEffects
      const { shouldRenderBloom } = this.computedState

      if (isRunning && shouldRenderBloom) {
        postBuffers.get('full').use(() => {
          drawTexture({
            color: postBuffers.get('blurB'),
            scale: 1 - bloom.feedbackOffset * 0.2
          })
        })
      }
    },

    renderSceneUI () {
      const { viewResolution, viewOffset, viewScale } = this.computedState

      cameras.scene.setup({
        viewResolution,
        viewOffset,
        viewScale
      }, () => {
        this.renderLines(sceneAltUI, {
          polarAlpha: 0.4,
          renderMirror: false
        })
        this.renderUI(sceneUI)
      })
    }
  }

  tasks.add(view, 'update')
  tasks.add(view, 'render')
  view.inject()

  return {
    tasks,
    state
  }
}
