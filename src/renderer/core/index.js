import { vec2, vec3, vec4, mat4 } from 'gl-matrix'
import Colr from 'colr'
// import Leap from 'leapjs'

import { createTaskManager } from '@renderer/utils/task'
import { createLoop } from '@renderer/utils/loop'
import { debounce } from '@renderer/utils/function'
import { lerp, radialPosition } from '@renderer/utils/math'
import { clampPixelRatio } from '@renderer/utils/screen'
import { logger } from '@renderer/utils/logger'
import { timer } from '@renderer/utils/timer'
import { toVec4 } from '@renderer/utils/color'
import {
  createGroupPool,
  createKeyedPool
} from '@renderer/utils/pool'

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
  const state = createCompositorState()
  const loop = createAnimationLoop()

  const renderer = createRenderer(tasks, state)
  const pools = createPools(tasks, state)
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
    const { recording } = state
    let animationFrame = 0
    const looper = {
      sync () {
        animationFrame = recording.isActive ? recording.tick : animationFrame + 1
        return animationFrame
      },
      update () {
        tasks.run('update', animationFrame)
      },
      render () {
        tasks.run('render', animationFrame)
      }
    }

    return createLoop(looper,
      'sync', 'update', 'render',
      (1 / 60 * 1000))
  }

  function createPools (tasks, state) {
    return {
      linesBatch: createGroupPool({
        createItem: () => ({
          mirror: new Float32Array(3)
        })
      }),
      blurBatch: createGroupPool({
        createItem: () => ({
          blurDirection: new Float32Array(2)
        })
      }),
      params: createKeyedPool({
        createItem: () => ({})
      }),
      color: createKeyedPool({
        createItem: () => ({
          colr: new Colr(),
          vec4: new Float32Array(4)
        })
      })
    }
  }

  function getVersionedPath (file) {
    if (!(file && file.path)) return null
    return `${file.path}?v=${file.version || 0}`
  }

  // TODO: Enable enabling / disabling Leap controller
  /*
  let controller = new Leap.Controller()
  controller.loop((frame) => {
    if (!frame.pointables.length) return
    seek.handMove(frame)
  })
  controller.connect()
  */

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
        shouldRenderMirror: false,
        shouldRenderBloom: false,
        shouldRenderBanding: false,
        shouldRenderEdges: false,
        shouldRenderLut: false,
        shouldRenderWatermark: false,
        mirrorIntensity: 0,
        mirrorAngle: 0,
        bloomIntensity: 0,
        bloomFeedbackPosition: vec2.create(),
        noiseIntensity: 0,
        bandingIntensity: 0,
        edgesIntensity: 0,
        vignetteParams: vec3.create(),
        lutIntensity: 0,
        watermarkIntensity: 0,
        lineThicknessScale: 1,
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
      const eventParams = { passive: false, capture: false }
      containers.scene.addEventListener('pointermove', seek.pointerMove, eventParams)
      containers.scene.addEventListener('pointerdown', drag.pointerDown, eventParams)

      window.addEventListener('resize', debounce(120, viewport.resize), eventParams)
      window.addEventListener('wheel', viewport.wheel, eventParams)
      document.addEventListener('keydown', viewport.keyDown, eventParams)
      document.addEventListener('keyup', viewport.keyUp, eventParams)

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

    // Message intercepted by Editor and saved to image file
    saveFrameData ({ path }) {
      logger.time('save frame data')
      const { regl, postBuffers } = renderer
      const { resolution } = state.viewport
      const width = resolution[0]
      const height = resolution[1]

      postBuffers.resize('fullExport', resolution)
      this.renderScene(0, 'fullExport')

      const buffer = new Uint8Array(width * height * 4)
      postBuffers.use('fullExport', () => {
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
      this.updateComputedLineProps()
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
        // this.sendGeometryState()
      }
      if (tick % TICK_MSG_INTERVAL === 0) {
        // this.sendFrameState()
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

    updateComputedLineProps () {
      const { computedState } = this
      const { lineScaleFactor } = cameras.scene
      const { scale } = state.viewport
      const { zoomOffset } = state.drag
      computedState.lineThicknessScale = lerp(1, scale + zoomOffset, lineScaleFactor)
    },

    // TODO: Cleanup ...
    updateComputedPostState () {
      const { computedState } = this
      const { isRunning } = state.simulation
      const { postEffects } = state.controls
      const { size } = state.viewport
      const {
        mirror, bloom, banding, edges, lut,
        watermark, vignette, colorShift, noise
      } = postEffects

      const shouldRenderMirror = computedState.shouldRenderMirror = isRunning && mirror.enabled
      const shouldRenderBloom = computedState.shouldRenderBloom = isRunning &&
        bloom.enabled && bloom.blurPasses > 0 && bloom.intensityFactor > 0
      const shouldRenderBanding = computedState.shouldRenderBanding = isRunning &&
        banding.enabled && banding.intensityFactor > 0
      const shouldRenderEdges = computedState.shouldRenderEdges = isRunning && edges.enabled
      const shouldRenderLut = computedState.shouldRenderLut = isRunning &&
        lut.enabled && !!(lut.textureFile && lut.textureFile.path)
      const shouldRenderWatermark = computedState.shouldRenderWatermark = isRunning &&
        watermark.enabled && !!(watermark.textureFile && watermark.textureFile.path)

      computedState.mirrorIntensity = !shouldRenderMirror ? 0 : 1
      computedState.mirrorAngle = mirror.angle / 180 * Math.PI
      computedState.bloomIntensity = !shouldRenderBloom ? 0
        : (0.4 * bloom.intensityFactor)
      computedState.noiseIntensity = !isRunning || !noise.enabled ? 0.0
        : (0.06 * noise.intensityFactor)
      computedState.bandingIntensity = !shouldRenderBanding ? 0
        : (0.6 * banding.intensityFactor)
      computedState.edgesIntensity = !shouldRenderEdges ? 0
        : (0.25 * edges.intensityFactor)
      computedState.lutIntensity = !shouldRenderLut ? 0 : lut.intensityFactor
      computedState.watermarkIntensity = !shouldRenderWatermark ? 0 : watermark.intensityFactor

      radialPosition(computedState.bloomFeedbackPosition,
        vec2.set(scratchVec2A,
          -Math.sign(bloom.feedbackPolarOffset) * Math.pow(bloom.feedbackPolarOffset, 2), 0),
        bloom.feedbackPolarAngle / 180 * Math.PI)
      vec2.divide(computedState.bloomFeedbackPosition,
        computedState.bloomFeedbackPosition, size)

      vec3.set(computedState.vignetteParams,
        vignette.radius, vignette.smoothness,
        (isRunning && vignette.enabled) ? vignette.intensityFactor : 0)

      vec3.copy(computedState.colorShift,
        colorShift.enabled ? colorShift.hsl : colorShift.none)
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

      scene.resetLines()
      sceneAltUI.resetLines()
      uiMain.lines.reset()

      drawOrigin(state, uiMain.ctx)
      drawSimulatorForces(state, sceneUIContexts[0].ctx, 8, 1)

      if (isRunning) {
        drawOriginTick(state, uiMain.ctx)
        drawSimulatorForcesTick(state, uiMain.ctx, 8, 1)
        drawSimulatorPointerForces(state, sceneUIContexts[0].ctx, 4, 1)
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
      for (let i = 0; i < sceneContexts.length; i++) {
        let context = sceneContexts[i]
        if (context.lines.state.cursor.element > context.bufferSize) {
          const nextSize = context.bufferSize = context.bufferSize + context.bufferInterval
          context.lines.resize(nextSize)
          didResizeBuffer = true
          logger.log('resize lines buffer', context.index, nextSize)
        }
      }

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

      bufPixelRatio = edges.bufferScale
      postBuffers.resize('edges', resolution,
        clampPixelRatio(resolution, bufPixelRatio, maxDimension))

      bufPixelRatio = bloom.bufferScale / pixelRatioNative
      postBuffers.resize('blurA', resolution,
        clampPixelRatio(resolution, bufPixelRatio, maxDimension))
      postBuffers.resize('blurB', resolution,
        clampPixelRatio(resolution, bufPixelRatio, maxDimension))
    },

    renderSceneBlurPasses (viewResolution, radiusStep, count) {
      const { drawGaussBlur } = renderer.commands
      const blurCount = count * 2
      const blurBatch = pools.blurBatch.getGroup(blurCount)

      for (let i = 0; i < blurCount; i++) {
        const blurParams = blurBatch[i]
        const radius = (1 + Math.floor(i / 2)) * radiusStep

        blurParams.blurDirection = (i % 2 === 0)
          ? vec2.set(blurParams.blurDirection, radius, 0)
          : vec2.set(blurParams.blurDirection, 0, radius)
        blurParams.framebufferName = (i % 2 === 0) ? 'blurA' : 'blurB'
        blurParams.colorName = (i === 0) ? 'full'
          : (i % 2 === 0) ? 'blurB' : 'blurA'
        blurParams.viewResolution = viewResolution
      }

      state.renderer.drawCalls += blurCount
      state.renderer.fullScreenPasses += blurCount
      drawGaussBlur(blurBatch)
    },

    // TODO: Ensure line thickness is correct on high dpi
    computeLineThickness (baseThickness) {
      const { lineThicknessScale } = this.computedState
      const { pixelRatio } = state.controls.viewport
      const pixelRatioAdjust = 0.5 / pixelRatio
      return (baseThickness + pixelRatioAdjust) * lineThicknessScale
    },

    shouldAdjustThickness () {
      return cameras.scene.shouldAdjustThickness
    },

    renderLines ({ contexts }, { polarAlpha, renderMirror }, styles) {
      const { tick, isRunning } = state.simulation
      const { alphaFunctions, postEffects } = state.controls
      const { polar } = postEffects

      const model = mat4.identity(scratchMat4A)
      const polarIterations = polar.enabled ? polar.iterations : 1
      const polarStep = Math.PI * 2 / polarIterations
      const mirrorAlpha = polar.enabled
        ? polar.mirrorIntensityFactor * (isRunning ? 1 : 0.2)
        : 0
      const adjustProjectedThickness = this.shouldAdjustThickness()

      for (let i = 0; i < contexts.length; i++) {
        const { index, lines } = contexts[i]
        if (lines.state.cursor.vertex === 0) continue

        const shouldRenderMirror = renderMirror && mirrorAlpha > 0.0
        const linesCount = polarIterations * (shouldRenderMirror ? 2 : 1)
        const linesBatch = pools.linesBatch.getGroup(linesCount)

        const style = styles[index]
        const {
          lineAlphaFuncIndex, lineAlphaMapRepeat, lineAlphaMapFile,
          fillAlphaFuncIndex, fillAlphaMapRepeat, fillAlphaMapFile,
          lineTintHex, lineTintAlpha,
          fillTintHex, fillTintAlpha
        } = style

        // OPTIM: Cache unchanged computed rgba array
        const lineTint = pools.color.get(`lineTint_${i}`)
        const lineTintVec = toVec4(lineTint.vec4, lineTint.colr, lineTintHex, lineTintAlpha)
        const fillTint = pools.color.get(`fillTint_${i}`)
        const fillTintVec = toVec4(fillTint.vec4, fillTint.colr, fillTintHex, fillTintAlpha)

        const thickness = this.computeLineThickness(style.thickness)
        const miterLimit = this.computeLineThickness(4)
        const lineAlphaFunc = alphaFunctions.all[lineAlphaFuncIndex || 0]
        const lineAlphaMapPath = getVersionedPath(lineAlphaMapFile)
        const fillAlphaFunc = alphaFunctions.all[fillAlphaFuncIndex || 0]
        const fillAlphaMapPath = getVersionedPath(fillAlphaMapFile)

        for (let j = 0; j < linesCount; j++) {
          const params = linesBatch[j]
          const polarIndex = shouldRenderMirror ? Math.floor(j / 2) : j
          const isMirrorStep = shouldRenderMirror && j % 2 !== 0

          params.tick = tick
          params.model = model
          params.adjustProjectedThickness = adjustProjectedThickness

          params.thickness = thickness
          params.miterLimit = miterLimit

          params.lineTint = lineTintVec
          params.lineAlphaMapRepeat = lineAlphaMapRepeat
          params.lineDashFunction = lineAlphaFunc.dashFunction
          params.lineAlphaMapPath = lineAlphaMapPath

          params.fillTint = fillTintVec
          params.fillAlphaMapRepeat = fillAlphaMapRepeat
          params.fillDashFunction = fillAlphaFunc.dashFunction
          params.fillAlphaMapPath = fillAlphaMapPath

          params.angle = polarIndex * polarStep
          params.angleAlpha = polarIndex === 0 ? 1 : polarAlpha
          params.mirror = isMirrorStep
            ? vec3.set(params.mirror, -1, 1, mirrorAlpha)
            : vec3.set(params.mirror, 1, 1, 1)
        }

        // TODO: Account for fill draw calls
        state.renderer.drawCalls += linesCount
        state.renderer.lineQuads += lines.state.cursor.quad
        lines.draw(linesBatch)
      }
    },

    renderUI ({ contexts }) {
      const { isRunning } = state.simulation
      const { overlay } = state.controls.viewport

      const linesParams = pools.params.get('uiLines')
      linesParams.model = mat4.identity(scratchMat4A)
      linesParams.tint = vec4.set(scratchVec4A, 1, 1, 1,
        isRunning ? overlay.alphaFactor : 1.0)
      linesParams.thickness = this.computeLineThickness(1)
      linesParams.miterLimit = this.computeLineThickness(4)
      linesParams.adjustProjectedThickness = this.shouldAdjustThickness()

      for (let i = 0; i < contexts.length; i++) {
        let { name, lines } = contexts[i]
        if (isRunning && name === 'grid') continue
        state.renderer.drawCalls++
        state.renderer.lineQuads += lines.state.cursor.quad
        lines.draw(linesParams)
      }
    },

    // Render Scene
    // ..................................................

    renderScene (tick, fbo = null) {
      this.resizeRenderBuffers()
      this.renderSceneMain()
      this.renderSceneBloom(tick)
      this.renderSceneBanding(tick)
      this.renderSceneEdges(tick)
      this.renderSceneComposite(tick, fbo)
      this.renderSceneBloomFeedback(tick)
      this.renderSceneUI()
    },

    renderSceneMain () {
      timer.begin('renderLines')

      const { postBuffers } = renderer
      const { drawRect } = renderer.commands
      const { isRunning } = state.simulation
      const { didResize } = state.viewport
      const { styles } = state.controls
      const { background } = state.controls.viewport
      const { viewResolution, viewOffset, viewScale } = this.computedState

      const clearHex = background.colorHex
      const clearAlpha = didResize ? 1
        : (!isRunning ? 0.6
          : (0.025 * background.alphaFactor))
      const clearColor = pools.color.get('clearColor')
      const clearColorVec = toVec4(clearColor.vec4, clearColor.colr, clearHex, clearAlpha)

      const clearParams = pools.params.get('clear')
      clearParams.color = clearColorVec

      const sceneCameraParams = pools.params.get('sceneCamera')
      sceneCameraParams.viewResolution = viewResolution
      sceneCameraParams.viewOffset = viewOffset
      sceneCameraParams.viewScale = viewScale

      const sceneLinesParams = pools.params.get('sceneLinesBase')
      sceneLinesParams.polarAlpha = isRunning ? 1 : 0.025
      sceneLinesParams.renderMirror = true

      state.renderer.drawCalls++
      postBuffers.use('full', () => {
        drawRect(clearParams)
        cameras.scene.setup(sceneCameraParams, () => {
          this.renderLines(scene, sceneLinesParams, styles)
        })
      })

      timer.end('renderLines')
    },

    renderSceneBloom () {
      timer.begin('renderBloom')

      const { viewResolution, shouldRenderBloom } = this.computedState
      const { bloom } = state.controls.postEffects

      if (shouldRenderBloom) {
        this.renderSceneBlurPasses(viewResolution,
          bloom.blurStep, bloom.blurPasses)
      }

      timer.end('renderBloom')
    },

    renderSceneBanding (tick) {
      timer.begin('renderBanding')

      const { drawBanding } = renderer.commands
      const { banding } = state.controls.postEffects
      const { shouldRenderBanding } = this.computedState

      if (shouldRenderBanding) {
        const bandingParams = pools.params.get('banding')
        bandingParams.tick = tick
        bandingParams.framebufferName = 'banding'
        bandingParams.colorName = 'full'
        bandingParams.bandingStep = banding.bandStep

        state.renderer.drawCalls++
        state.renderer.fullScreenPasses++
        drawBanding(bandingParams)
      }

      timer.end('renderBanding')
    },

    renderSceneEdges (tick) {
      timer.begin('renderEdges')

      const { drawEdges } = renderer.commands
      const { edges } = state.controls.postEffects
      const { shouldRenderBanding, shouldRenderEdges, viewResolution } = this.computedState

      if (shouldRenderEdges) {
        const edgesParams = pools.params.get('edges')
        edgesParams.tick = tick
        edgesParams.viewResolution = viewResolution
        edgesParams.framebufferName = 'edges'
        edgesParams.colorName = shouldRenderBanding ? 'banding' : 'full'
        edgesParams.thickness = edges.thickness
        edgesParams.repeat = edges.repeat

        state.renderer.drawCalls++
        state.renderer.fullScreenPasses++
        drawEdges(edgesParams)
      }

      timer.end('renderEdges')
    },

    renderSceneComposite (tick, fboName) {
      timer.begin('renderComposite')

      const { textures } = renderer
      const { drawScreen } = renderer.commands
      const { isRunning } = state.simulation
      const { overlay } = state.controls.viewport
      const { lut, watermark } = state.controls.postEffects
      const {
        viewResolution, viewOffset, viewScale, forcePositions,
        shouldRenderBanding, shouldRenderEdges,
        shouldRenderLut, shouldRenderWatermark,
        mirrorIntensity, mirrorAngle, bandingIntensity,
        edgesIntensity, lutIntensity, watermarkIntensity,
        vignetteParams, colorShift, noiseIntensity
      } = this.computedState
      const compositeParams = pools.params.get('composite')

      compositeParams.framebufferName = fboName || null
      compositeParams.colorName = 'full'
      compositeParams.bandingName = shouldRenderBanding ? 'banding' : 'blank'
      compositeParams.edgesName = shouldRenderEdges ? 'edges' : 'blank'

      compositeParams.lutTexture = textures.get('lut',
        shouldRenderLut ? lut.textureFile.path : null)
      compositeParams.watermarkTexture = textures.get('watermark',
        shouldRenderWatermark ? watermark.textureFile.path : null)

      compositeParams.bandingIntensity = bandingIntensity
      compositeParams.edgesIntensity = edgesIntensity
      compositeParams.lutIntensity = lutIntensity
      compositeParams.watermarkIntensity = watermarkIntensity

      compositeParams.colorShift = colorShift
      compositeParams.mirrorIntensity = mirrorIntensity
      compositeParams.mirrorAngle = mirrorAngle
      compositeParams.overlayAlpha = isRunning ? overlay.alphaFactor : 1
      compositeParams.originAlpha = isRunning ? 0 : 1
      compositeParams.vignetteParams = vignetteParams
      compositeParams.noiseIntensity = noiseIntensity
      compositeParams.tick = tick
      compositeParams.viewOffset = viewOffset
      compositeParams.viewResolution = viewResolution
      compositeParams.viewScale = viewScale
      compositeParams.forcePositions = forcePositions

      state.renderer.drawCalls++
      state.renderer.fullScreenPasses++
      drawScreen(compositeParams)

      timer.end('renderComposite')
    },

    renderSceneBloomFeedback () {
      const { drawTexture } = renderer.commands
      const { isRunning } = state.simulation
      const { bloom } = state.controls.postEffects
      const { shouldRenderBloom, bloomFeedbackPosition } = this.computedState

      if (isRunning && shouldRenderBloom) {
        const feedbackParams = pools.params.get('feedback')
        feedbackParams.framebufferName = 'full'
        feedbackParams.colorName = 'blurB'
        feedbackParams.offset = bloomFeedbackPosition
        feedbackParams.scale = 1 - bloom.feedbackOffset * 0.05

        state.renderer.drawCalls++
        state.renderer.fullScreenPasses++
        drawTexture(feedbackParams)
      }
    },

    renderSceneUI () {
      const { viewResolution, viewOffset, viewScale } = this.computedState
      const { stylesUI } = state.controls

      const sceneCameraParams = pools.params.get('sceneCamera')
      sceneCameraParams.viewResolution = viewResolution
      sceneCameraParams.viewOffset = viewOffset
      sceneCameraParams.viewScale = viewScale

      const uiLinesParams = pools.params.get('uiLinesBase')
      uiLinesParams.polarAlpha = 0.4
      uiLinesParams.renderMirror = false

      cameras.scene.setup(sceneCameraParams, () => {
        this.renderLines(sceneAltUI, uiLinesParams, stylesUI)
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
