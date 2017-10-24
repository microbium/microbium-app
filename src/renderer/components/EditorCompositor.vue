<template>
  <div id="editor-compositor">
    <div id="compositor"></div>
  </div>
</template>

<style>
#compositor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mode--simulate {
  cursor: none;
}
.mode--edit {
  cursor: crosshair;
}

.controls--hidden {
  display: none;
}
</style>

<script>
// TODO: Refactor to make more modular, integrate with vue

import {
  vec2,
  vec3,
  mat2d,
  mat4
} from 'gl-matrix'

import {
  BoundingPlaneConstraint,
  DistanceConstraint,
  PointConstraint,
  ParticleSystem
} from 'particulate'

import createREGL from 'regl'
import { LineBuilder } from 'regl-line-builder'

import { createTaskManager } from '@/utils/task'
import { createLoop } from '@/utils/loop'
import { debounce } from '@/utils/function'
import { range, map, flatten2 } from '@/utils/array'
import { clamp, mapLinear } from '@/utils/math'
import { curve } from '@/utils/draw'
import { logger } from '@/utils/logger'

import { createDrawRect } from '@/commands/screen-space'
import { RepulsorForce } from '@/forces/RepulsorForce'
import { RotatorForce } from '@/forces/RotatorForce'

import linesEntitiesVert from '@/shaders/lines-entities.vert'
import linesEntitiesFrag from '@/shaders/lines-entities.frag'

const DISABLE_RENDER = false

const MAX_UINT16_VALUE = 2 ** 16

const LINE_WIDTH = {
  ULTRA_THIN: 0.5,
  THIN: 1,
  REGULAR: 2,
  THICK: 4,
  FAT: 8
}
const LINE_WIDTH_KEYS = ['ULTRA_THIN', 'THIN', 'REGULAR', 'THICK', 'FAT']

const TEXTURES = {
  'watercolor': require('../assets/images/textures/watercolor.jpg'),
  'ground-mud': require('../assets/images/textures/ground-mud.jpg')
}

const scratchVec2A = vec2.create()
const scratchVec3A = vec3.create()
const scratchVec3B = vec3.create()
const scratchMat2dA = mat2d.create()
const scratchMat4A = mat4.create()

function mountCompositor ($el, $electron) {
  const tasks = createTaskManager(
    'inject', 'syncState',
    'update', 'render', 'resize')

  const containers = {
    compositor: getContainer('compositor'),
    controls: getContainer('controls')
  }

  const state = createState()
  const renderer = createRenderer()
  const cameras = createCameras()
  const scene = createScene()
  const sceneUI = createUIScene()
  const loop = createAnimationLoop()

  function getContainer (name) {
    return document.getElementById(name)
  }

  function createRenderer () {
    const regl = createREGL({
      container: containers.compositor,
      extensions: [
        // 'angle_instanced_arrays',
        'oes_standard_derivatives'
      ],
      attributes: {
        antialias: true,
        preserveDrawingBuffer: true
      }
    })

    const drawRect = createDrawRect(regl)
    const createTexture = createTextureManager(regl)

    return {
      regl,
      drawRect,
      createTexture
    }
  }

  function createCameras () {
    const { regl } = renderer

    const scene = (() => {
      const view = mat4.create()
      const projection = mat4.create()
      const setup = regl({
        uniforms: {
          view: (params, context) => {
            const { offset, scale } = context
            const offset3 = vec3.set(scratchVec3A, offset[0], offset[1], 0)
            const scale3 = vec3.set(scratchVec3B, scale, scale, scale)
            mat4.fromTranslation(view, offset3)
            mat4.scale(view, view, scale3)
            return view
          },
          projection: () => projection,
          viewResolution: () => state.viewport.size,
          viewOffset: regl.prop('offset')
        }
      })
      return {
        view,
        projection,
        setup
      }
    })()

    const ui = (() => {
      const view = mat4.create()
      const projection = mat4.create()
      const setup = regl({
        uniforms: {
          view,
          projection: () => projection
        }
      })
      return {
        view,
        projection,
        setup
      }
    })()

    tasks.add((event) => {
      const { size } = state.viewport
      const w = size[0] / 4
      const h = size[1] / 4
      mat4.ortho(scene.projection, -w, w, h, -h, 0, 1)
      mat4.copy(ui.projection, scene.projection)
    }, 'resize')

    return {
      scene,
      ui
    }
  }

  function createScene () {
    const { createTexture, regl } = renderer
    const { lineStyles } = state.renderer

    // TODO: Investigate huge perf issues in Chrome when using instancing
    // TODO: Optimize shared state between contexts
    const styleContexts = lineStyles.map((style, index) => {
      const bufferSize = 2 ** 12
      const lines = LineBuilder.create(regl, {
        bufferSize,
        drawArgs: {
          vert: linesEntitiesVert,
          frag: linesEntitiesFrag,
          uniforms: {
            angle: regl.prop('angle'),
            angleAlpha: regl.prop('angleAlpha'),
            hatchAlpha: regl.prop('hatchAlpha'),
            diffuseMap: (params, { diffuseMap }) => createTexture(diffuseMap, 2048)
          },
          blend: {
            enable: true,
            equation: 'add',
            func: {
              src: 'src alpha',
              dst: 'one minus src alpha'
            }
          }
        }
      })

      const ctx = lines.getContext('2d')
      ctx.curve = curve.bind(lines)

      return {
        bufferSize,
        index,
        style,
        lines,
        ctx
      }
    })

    return {
      styleContexts
    }
  }

  function createUIScene () {
    const { regl } = renderer

    const lines = LineBuilder.create(regl, {
      // TODO: Make bufferSize smallest possible for UI
      bufferSize: 512
    })

    const ctx = lines.getContext('2d')
    ctx.curve = curve.bind(lines)

    return {
      lines,
      ctx
    }
  }

  function createTextureManager (regl) {
    const cache = {}

    return function createTexture (key, size) {
      if (key == null) return null

      const cached = cache[key]
      if (cached) return cached

      const image = document.createElement('img')
      const texture = cache[key] = regl.texture({
        width: size,
        height: size
      })
      image.src = TEXTURES[key]
      image.onload = () => {
        texture({data: image})
      }

      return texture
    }
  }

  function createAnimationLoop () {
    let animationFrame = 0
    return createLoop(null,
      () => tasks.run('update', animationFrame++),
      () => tasks.run('render', animationFrame),
      (1 / 60 * 1000))
  }

  function createState () {
    const seek = {
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
      hasMoved: false,
      isDrawing: false,
      isPanning: false,
      isZooming: false,

      panDown: vec2.create(),
      panOffset: vec2.create(),
      zoomDown: 1,
      zoomOffset: 0,

      velocity: 0,
      down: vec2.create(),
      move: vec2.create(),
      movePrev: vec2.create(),
      up: vec2.create()
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
          thickness: 1
        },
        {
          diffuseMap: 'ground-mud',
          hatchAlpha: 1,
          tint: [1, 1, 1, 1],
          thickness: 1
        }
      ]
    }

    const controls = {
      // TODO: Enable more fine control over lineWidth
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

  // Geometry

  const geometry = {
    // TODO: Improve curve precision mapping
    computeCurvePrecision: function (vertices, indices) {
      let segmentLength = 0
      for (let i = 0; i < indices.length - 1; i++) {
        segmentLength += vec2.distance(
          vertices[indices[i]], vertices[indices[i + 1]])
      }

      const linkSizeAvg = segmentLength / (indices.length - 1)
      return Math.round(clamp(0, 1,
        mapLinear(12, 120, 0, 1, linkSizeAvg)))
    },

    // TODO: Optimize with spacial index (kd-tree)
    findClosestPoint (target, maxDist = 10, lastOffset = 0) {
      const { vertices } = state.geometry
      const maxDistSq = maxDist * maxDist
      const count = vertices.length - lastOffset
      let closestPointIndex = null
      let closestDistSq = Infinity
      for (let i = 0; i < count; i++) {
        const point = vertices[i]
        const distSq = vec2.squaredDistance(target, point)
        if (distSq < maxDistSq && distSq < closestDistSq) {
          closestPointIndex = i
          closestDistSq = distSq
        }
      }
      if (closestPointIndex != null) {
        return {
          index: closestPointIndex,
          point: vertices[closestPointIndex]
        }
      }
      return null
    },

    createBaseFromState (initialState) {
      const { segments, vertices } = initialState
      Object.assign(state.geometry, {
        segments,
        vertices
      })
    },

    createBaseSegment () {
      const radius = 20
      const count = 5

      const lineWidthStepPrev = state.controls.lineWidthStep
      const lineStyleIndexPrev = state.controls.lineStyleIndex
      const lineColorPrev = state.controls.lineColor
      const lineAlphaPrev = state.controls.lineAlpha

      state.geometry.shouldAppend = true
      Object.assign(state.controls, {
        lineWidthStep: 2,
        lineStyleIndex: 0,
        lineColor: '#58BAA4',
        lineAlpha: 0.6
      })

      geometry.createSegment([radius, 0])
      for (let i = 1; i < (1 + count); i++) {
        const angle = i / count * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        geometry.updateActiveSegment([x, y])
      }
      geometry.completeActiveSegment(0)

      state.geometry.shouldAppend = false
      Object.assign(state.controls, {
        lineWidthStep: lineWidthStepPrev,
        lineStyleIndex: lineStyleIndexPrev,
        lineColor: lineColorPrev,
        lineAlpha: lineAlphaPrev
      })
    },

    createSegment (point, index) {
      const stateGeom = state.geometry
      const { segments, vertices, linkSizeMin } = stateGeom
      const { lineWidth, lineStyleIndex, lineColor, lineAlpha } = state.controls
      const isExisting = index != null

      const startPoint = isExisting ? point : vec2.clone(point)
      const startIndex = isExisting ? index : vertices.length

      console.log(lineWidth, lineStyleIndex, lineColor, lineAlpha)

      const nextSegment = {
        indices: [startIndex],
        curvePrecision: 0,
        lineWidth,
        lineStyleIndex,
        lineColor,
        lineAlpha,
        linkSizeMin
      }

      if (!isExisting) vertices.push(startPoint)
      segments.push(nextSegment)
      Object.assign(stateGeom, {
        candidatePoint: null,
        prevPoint: startPoint,
        activeSegment: nextSegment,
        activeSegmentIsConnected: index != null
      })
    },

    // TODO: Improve appending joints in Chrome
    updateActiveSegment (point, index) {
      const stateGeom = state.geometry
      const { shouldAppend, shouldAppendOnce, activeSegment, prevPoint, vertices } = stateGeom
      if (!activeSegment) return

      const { linkSizeMin, indices } = activeSegment
      const hasCandidate = !!stateGeom.candidatePoint
      const candidatePoint = stateGeom.candidatePoint || vec2.create()

      vec2.copy(candidatePoint, point)
      const dist = vec2.distance(prevPoint, candidatePoint)

      activeSegment.curvePrecision =
        geometry.computeCurvePrecision(vertices, indices)

      if (!hasCandidate) {
        stateGeom.candidatePoint = candidatePoint
        indices.push(vertices.length)
        vertices.push(candidatePoint)
      }

      if ((shouldAppend || shouldAppendOnce) && dist >= linkSizeMin) {
        if (index != null) {
          indices[indices.length - 1] = index
          vertices.pop()
        }
        stateGeom.prevPoint = candidatePoint
        stateGeom.candidatePoint = null
        stateGeom.shouldAppendOnce = false
      }
    },

    completeActiveSegment (index) {
      const stateGeom = state.geometry
      const { activeSegment, vertices } = stateGeom
      const { indices } = activeSegment

      const firstIndex = indices[0]
      const lastIndex = indices[indices.length - 1]
      const isConnected = index != null && lastIndex !== index
      const isClosed = isConnected && firstIndex === index

      if (isConnected) {
        indices[indices.length - 1] = index
        // FIXME: Somehow getting duplicate vertices at end
        if (indices.length > 2 && indices[indices.length - 2] === lastIndex) {
          indices[indices.length - 2] = index
        }
        vertices.pop()
      }

      Object.assign(activeSegment, {
        isClosed,
        indices: new Uint16Array(indices)
      })
    },

    ensureActiveSegmentValid () {
      const stateGeom = state.geometry
      const {
        activeSegment, activeSegmentIsConnected,
        segments, vertices
      } = stateGeom
      const { indices } = activeSegment
      const isInvalid = indices.length === 1 ||
        (indices.length === 2 && indices[0] === indices[1])

      if (isInvalid) {
        stateGeom.activeSegment = null
        segments.pop()
        if (!activeSegmentIsConnected) vertices.pop()
      }
    },

    // TODO: Create variation on DistanceConstraint that accepts indices in this segment format
    expandIndicesToLines (indices) {
      return indices.slice(0, -1).reduce((all, v, i) => {
        const a = indices[i]
        const b = indices[i + 1]
        all.push([a, b])
        return all
      }, [])
    },

    drawSegments (styleContexts, segmentStart_, segmentCount_) {
      const { segments, vertices } = state.geometry
      const { curveSubDivisions } = state.controls
      const segmentStart = segmentStart_ || 0
      const segmentCount = segmentCount_ || segments.length

      for (let s = segmentStart; s < segmentCount; s++) {
        const segment = segments[s]
        const {
          indices, isClosed,
          lineWidth, lineStyleIndex, lineColor, lineAlpha
        } = segment
        const curvePrecision = segment.curvePrecision * curveSubDivisions
        const count = isClosed ? indices.length - 1 : indices.length
        if (count < 2) return

        const { ctx } = styleContexts[lineStyleIndex]
        ctx.globalAlpha = (curvePrecision <= 1 ? 0.8 : 0.4) * lineAlpha
        ctx.lineWidth = curvePrecision <= 1 ? LINE_WIDTH[lineWidth] : LINE_WIDTH.THIN
        ctx.strokeStyle = lineColor

        ctx.beginPath()
        for (let i = 0; i < count; i++) {
          const index = indices[i]
          const point = vertices[index]
          if (i === 0) ctx.moveTo(point[0], point[1])
          else ctx.lineTo(point[0], point[1])
        }
        if (isClosed) {
          ctx.closePath()
          // ctx.fill()
        }
        ctx.stroke()
      }
    },

    drawSegmentsCurves (styleContexts, segmentStart_, segmentCount_) {
      const { segments, vertices } = state.geometry
      const { curveSubDivisions } = state.controls
      const segmentStart = segmentStart_ || 0
      const segmentCount = segmentCount_ || segments.length

      for (let s = segmentStart; s < segmentCount; s++) {
        const segment = segments[s]
        const {
          indices, isClosed,
          lineWidth, lineStyleIndex, lineColor, lineAlpha
        } = segment
        const curvePrecision = segment.curvePrecision * curveSubDivisions
        const count = isClosed ? indices.length - 1 : indices.length
        if (count < 2 || curvePrecision <= 1) return

        const { ctx } = styleContexts[lineStyleIndex]
        const points = map(indices, (i) => vertices[i])
        const pointsFlat = flatten2(points)

        // TODO: Fix closed curve segments
        if (isClosed) pointsFlat.splice(-2, 2)

        ctx.globalAlpha = 0.8 * lineAlpha
        ctx.lineWidth = LINE_WIDTH[lineWidth]
        ctx.strokeStyle = lineColor

        ctx.beginPath()
        ctx.moveTo(pointsFlat[0], pointsFlat[1])
        ctx.curve(pointsFlat, 0.5, curvePrecision, isClosed)
        if (isClosed) {
          ctx.closePath()
          // ctx.fill()
        }
        ctx.stroke()
      }
    },

    drawFocus (ctx, index) {
      const { vertices } = state.geometry
      const point = vertices[index]
      if (!point) return

      ctx.strokeStyle = '#58BAA4'
      ctx.globalAlpha = 0.6
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(point[0], point[1], 6, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = '#444444'
      ctx.globalAlpha = 0.25
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(point[0], point[1], 18, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // Simulation

  const simulation = {
    toggle () {
      const { isRunning } = state.simulation
      state.simulation.isRunning = !isRunning
      if (!isRunning) {
        logger.time('create simulation')
        simulation.createFromGeometry()
        logger.timeEnd('create simulation')
      }
    },

    createFromGeometry () {
      const { segments, vertices } = state.geometry
      const count = vertices.length
      const system = ParticleSystem.create(count, 2)

      vertices.forEach((vert, i) => {
        system.setPosition(i, vert[0], vert[1], 0)
      })

      // NOTE: First base segment is pinned to center
      segments[0].indices.slice(1).forEach((index) => {
        const position = system.getPosition(index, [])
        const pin = PointConstraint.create(position, index)
        system.addPinConstraint(pin)
      })

      segments.slice(1).forEach((segment) => {
        const lines = geometry.expandIndicesToLines(segment.indices)
        lines.forEach((line) => {
          const distance = vec2.distance(
            vertices[line[0]],
            vertices[line[1]])
          const constraint = DistanceConstraint.create(
            [distance * 0.95, distance], line)
          system.addConstraint(constraint)
        })
      })

      const bounds = BoundingPlaneConstraint.create(
        [0, 0, 0], [0, 0, 1], Infinity)
      bounds.friction = 0.01
      system.addConstraint(bounds)

      const nudge = RepulsorForce.create([0, 0, 0], {
        radius: 80,
        intensity: 0.1
      })
      const diffusor = RepulsorForce.create([0, 0, 0], {
        radius: 800,
        intensity: 0.01
      })
      const rotator = RotatorForce.create([0, 0, 0], {
        radius: 800,
        intensity: 0.01
      })
      system.addForce(nudge)
      system.addForce(diffusor)
      system.addForce(rotator)

      Object.assign(state.simulation, {
        system,
        bounds,
        nudge,
        diffusor,
        rotator
      })
    },

    updateForces () {
      const { nudge, diffusor, rotator, tick } = state.simulation
      const { move, velocity } = state.seek
      const { polarIterations } = state.controls

      const angleStep = Math.PI * 2 / polarIterations
      const angleIndex = tick % polarIterations
      const rotation = mat2d.fromRotation(scratchMat2dA, angleStep * angleIndex)
      const nudgePosition = vec2.transformMat2d(scratchVec2A, move, rotation)
      nudge.set(nudgePosition[0], nudgePosition[1], 0)
      nudge.intensity = Math.min(velocity, 3) * 1.5 + 2

      diffusor.intensity = Math.sin(tick * 0.012) * 0.01
      rotator.intensity = Math.sin(tick * 0.01) * 0.01
    },

    syncGeometry () {
      const { positions } = state.simulation.system
      const { vertices } = state.geometry

      vertices.forEach((vert, i) => {
        const ix = i * 3
        const iy = ix + 1
        vec2.set(vert, positions[ix], positions[iy])
      })
    }
  }

  // Events

  const seek = {
    // FIXME: Seek while panning
    mouseMove (event) {
      const stateSeek = state.seek
      const { isDown } = state.drag
      const { scale } = state.viewport
      const { move, movePrev } = stateSeek

      vec2.copy(movePrev, move)
      vec2.set(move, event.clientX, event.clientY)
      viewport.projectScreen(move)

      const dist = vec2.distance(movePrev, move)
      const velocity = (stateSeek.velocity + dist) / 2
      stateSeek.velocity = velocity

      const close = geometry.findClosestPoint(
        move, stateSeek.minDistance / scale, isDown ? 1 : 0)
      stateSeek.index = close ? close.index : null
    }
  }

  const drag = {
    contextMenu (event) {
      event.preventDefault()
    },

    mouseDown (event) {
      const stateDrag = state.drag
      const { isDown, shouldNavigate, shouldZoom, down } = stateDrag
      if (isDown || stateDrag.isDrawing) return

      const isDrawing = !shouldNavigate
      const isPanning = shouldNavigate && !shouldZoom
      const isZooming = shouldNavigate && shouldZoom
      vec2.set(down, event.clientX, event.clientY)
      viewport.projectScreen(down)

      stateDrag.isDown = true
      stateDrag.hasMoved = false
      stateDrag.isDrawing = isDrawing
      stateDrag.isPanning = isPanning
      stateDrag.isZooming = isZooming
      stateDrag.velocity = 0

      if (isDrawing) drag.beginDraw(down)
      else if (isPanning) drag.beginPan(down)
      else if (isZooming) drag.beginZoom(down)

      document.addEventListener('mousemove', drag.mouseMove, false)
      document.addEventListener('mouseup', drag.mouseUp, false)
      document.addEventListener('dblclick', drag.dblClick, false)
      event.preventDefault()
    },

    // TODO: Implement brush style interaction while hold / dragging
    mouseMove (event) {
      const stateDrag = state.drag
      const { isDrawing, isPanning, isZooming, move, movePrev } = stateDrag

      vec2.copy(movePrev, move)
      vec2.set(move, event.clientX, event.clientY)
      viewport.projectScreen(move)

      const dist = vec2.distance(movePrev, move)
      const velocity = (stateDrag.velocity + dist) / 2
      stateDrag.hasMoved = true
      stateDrag.velocity = velocity

      if (isDrawing) drag.moveDraw(move, velocity)
      else if (isPanning) drag.movePan(move, velocity)
      else if (isZooming) drag.moveZoom(move, velocity)

      event.preventDefault()
    },

    // TODO: Manage different interactions / commands separately
    mouseUp (event) {
      const stateDrag = state.drag
      const stateGeom = state.geometry
      const { hasMoved, isDrawing, isPanning, isZooming, up } = stateDrag

      if (isDrawing) {
        stateGeom.shouldAppendOnce = hasMoved
      } else {
        stateDrag.isDown = false
        stateDrag.isPanning = false
        stateDrag.isZooming = false
        stateDrag.velocity = 0

        vec2.set(up, event.clientX, event.clientY)
        viewport.projectScreen(up)

        if (isPanning) drag.endPan(up)
        else if (isZooming) drag.endZoom(up)

        document.removeEventListener('mousemove', drag.mouseMove)
        document.removeEventListener('mouseup', drag.mouseUp)
        document.removeEventListener('dblclick', drag.dblClick)
      }

      event.preventDefault()
    },

    dblClick (event) {
      const stateDrag = state.drag
      const { up } = stateDrag

      vec2.set(up, event.clientX, event.clientY)
      viewport.projectScreen(up)

      stateDrag.isDown = false
      stateDrag.isDrawing = false
      stateDrag.velocity = 0

      drag.endDraw(up)

      document.removeEventListener('mousemove', drag.mouseMove)
      document.removeEventListener('mouseup', drag.mouseUp)
      document.removeEventListener('dblclick', drag.dblClick)
      event.preventDefault()
    },

    // TODO: Add damping / improve feel to panning and zooming
    beginPan (down) {},

    movePan (move, velocity) {
      const { panOffset, down } = state.drag
      const { scale } = state.viewport
      vec2.sub(panOffset, move, down)
      vec2.scale(panOffset, panOffset, scale)
    },

    endPan (up) {
      const { panOffset } = state.drag
      const { offset } = state.viewport
      vec2.add(offset, offset, panOffset)
      vec2.set(panOffset, 0, 0)
    },

    beginZoom (down) {},

    moveZoom (move, velocity) {
      const { down, panOffset } = state.drag
      const { offset, size, scale } = state.viewport
      const diff = (move[1] - down[1]) * scale
      const nextZoomOffset = diff / (size[1] / scale * 0.4)

      vec2.copy(panOffset, offset)
      vec2.scale(panOffset, panOffset, nextZoomOffset / scale)
      state.drag.zoomOffset = nextZoomOffset
    },

    endZoom (up) {
      const { panOffset, zoomOffset } = state.drag
      const { offset, scale } = state.viewport
      state.viewport.scale = scale + zoomOffset
      state.drag.zoomOffset = 0
      vec2.add(offset, offset, panOffset)
      vec2.set(panOffset, 0, 0)
    },

    beginDraw (down) {
      const { minDistance } = state.seek
      const { scale } = state.viewport
      const close = geometry.findClosestPoint(down, minDistance / scale)
      if (close) geometry.createSegment(close.point, close.index)
      else geometry.createSegment(down)
    },

    moveDraw (move, velocity) {
      const { index } = state.seek
      geometry.updateActiveSegment(move, velocity < 2 ? index : null)
    },

    endDraw (up) {
      const { minDistance } = state.seek
      const { scale } = state.viewport
      const close = geometry.findClosestPoint(up, minDistance / scale, 1)
      geometry.completeActiveSegment(close && close.index)
      geometry.ensureActiveSegmentValid()
    }
  }

  const viewport = {
    toggleHelp (event) {
      const element = document.getElementById('help-container')
      element.classList.toggle('help--visible')
      event.preventDefault()
    },

    toggleControls () {
      state.viewport.controlsVisible = !state.viewport.controlsVisible
    },

    updateClassName () {
      containers.compositor.className = state.simulation.isRunning
        ? 'mode--simulate' : 'mode--edit'
    },

    projectScreen (screen) {
      const { center, offset, scale } = state.viewport
      vec2.sub(screen, screen, center)
      vec2.sub(screen, screen, offset)
      vec2.scale(screen, screen, 1 / scale)
      return screen
    },

    resize (event) {
      const stateViewport = state.viewport
      const width = window.innerWidth
      const height = window.innerHeight

      vec2.set(stateViewport.size, width, height)
      vec2.set(stateViewport.center, width / 2, height / 2)
      stateViewport.pixelRatio = window.devicePixelRatio || 1
      tasks.run('resize', event)
    },

    keyDown (event) {
      const { code } = event
      const stateDrag = state.drag
      const stateGeom = state.geometry
      const stateInput = state.input

      switch (code) {
        case 'AltLeft':
          stateInput.alt = true
          stateDrag.shouldNavigate = true
          break
        case 'ControlLeft':
          stateInput.control = true
          stateDrag.shouldZoom = true
          break
        case 'ShiftLeft':
          stateInput.shift = true
          stateGeom.shouldAppend = true
          break
      }
    },

    keyUp (event) {
      const { code } = event
      const stateDrag = state.drag
      const stateGeom = state.geometry
      const stateInput = state.input

      switch (code) {
        case 'AltLeft':
          stateInput.alt = false
          stateDrag.shouldNavigate = false
          break
        case 'ControlLeft':
          stateInput.control = false
          stateDrag.shouldZoom = false
          break
        case 'ShiftLeft':
          stateInput.shift = false
          stateGeom.shouldAppend = false
          break
        case 'Backquote':
          viewport.toggleControls()
          viewport.updateClassName()
          break
      }
    },

    keyCommand (event, data) {
      const { code } = data

      switch (code) {
        case 'Space':
          simulation.toggle()
          viewport.updateClassName()
          break
        case 'KeyS':
          view.saveGeometry()
          break
      }
    },

    message (event, data) {
      switch (data.type) {
        case 'UPDATE_CONTROLS':
          state.controls[data.key] = data.value
          break
      }
    }
  }

  // Route / Persist

  const route = {
    // TODO: Add lineStyleIndex
    serializeGeometry () {
      const stateGeom = state.geometry
      const { segments, vertices } = stateGeom
      const { map } = Array.prototype

      const lineWidthLookup = toHash(LINE_WIDTH_KEYS)

      function toHash (arr) {
        return arr.reduce((hash, v, i) => {
          hash[v] = i
          return hash
        }, {})
      }

      function toFixed (n, len) {
        const factor = Math.pow(10, len)
        return Math.round(n * factor) / factor
      }

      const segmentsStr = segments
        .map((segment) => {
          const { lineWidth } = segment
          return [
            lineWidthLookup[lineWidth],
            segment.indices.join(',')
          ].join('_')
        })
        .join('&')

      const verticesStr = vertices
        .map((vert) => {
          return map.call(vert, (v) => toFixed(v, 2)).join(',')
        })
        .join('&')

      return [
        segmentsStr,
        verticesStr
      ].join('__')
    },

    serializeGeometryToLocalStorage () {
      const hash = route.serializeGeometry()
      window.localStorage.setItem('editor-data', hash)
    },

    deserializeGeometry (str) {
      const [segmentsStr, verticesStr] = str.split('__')

      const vertices = verticesStr.split('&').map((str) => {
        const vals = str.split(',')
          .map((str) => parseFloat(str))
        return vec2.clone(vals)
      })

      const segments = segmentsStr.split('&').map((str) => {
        const [lineWidthStr, indicesStr] = str.split('_')

        const lineWidth = LINE_WIDTH_KEYS[parseInt(lineWidthStr, 10)]
        const indices = indicesStr.split(',')
          .map((str) => parseInt(str, 10))

        return {
          lineWidth,
          indices: new Uint16Array(indices),
          curvePrecision: geometry.computeCurvePrecision(vertices, indices),
          isClosed: indices[0] === indices[indices.length - 1]
        }
      })

      return {
        segments,
        vertices
      }
    },

    deserializeGeometryFromLocalStorage () {
      const hash = window.localStorage.getItem('editor-data')
      if (!hash) return null
      return route.deserializeGeometry(hash)
    }
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
      })
    },

    start () {
      tasks.run('syncState')
      loop.start()
    },

    bindEvents () {
      containers.compositor.addEventListener('mousemove', seek.mouseMove, false)
      containers.compositor.addEventListener('mousedown', drag.mouseDown, false)
      // containers.compositor.addEventListener('contextmenu', drag.contextMenu, false)
      window.addEventListener('resize', debounce(1 / 60, viewport.resize), false)
      document.addEventListener('keydown', viewport.keyDown, false)
      document.addEventListener('keyup', viewport.keyUp, false)
      $electron.ipcRenderer.on('message', viewport.message)
      $electron.ipcRenderer.on('key-command', viewport.keyCommand)
    },

    initGeometry () {
      logger.time('deserialize geometry')
      const initialState = route.deserializeGeometryFromLocalStorage()
      logger.timeEnd('deserialize geometry')
      logger.log('initial state', initialState)
      if (initialState && initialState.segments.length) {
        geometry.createBaseFromState(initialState)
      } else {
        geometry.createBaseSegment()
      }
    },

    saveGeometry () {
      logger.time('serialize geometry')
      route.serializeGeometryToLocalStorage()
      logger.timeEnd('serialize geometry')
    },

    update () {
      if (state.simulation.isRunning) {
        state.simulation.tick++
        simulation.updateForces()
        state.simulation.system.tick(1)
        simulation.syncGeometry()
      }
    },

    updateControlsState (nextState) {
    },

    render () {
      const { regl } = renderer
      const { styleContexts } = scene
      const { offset, scale } = state.viewport
      const { panOffset, zoomOffset } = state.drag
      const { isRunning } = state.simulation
      const stateRenderer = state.renderer

      if (DISABLE_RENDER) return

      stateRenderer.drawCalls = 0
      regl.poll()

      styleContexts.forEach(({ lines }) => {
        lines.reset()
      })
      sceneUI.lines.reset()

      // view.drawEditorUI(sceneUI.ctx)
      // view.drawSimulatorUI(sceneUI.ctx)
      view.drawSimulatorForceUI(styleContexts[0].ctx, 0, 1)
      view.drawSimulatorForceUI(sceneUI.ctx, 8, 1)
      view.drawSimulatorOriginUI(sceneUI.ctx)

      if (isRunning) {
        view.drawOriginTick(sceneUI.ctx)
      } else {
        view.drawOrigin(sceneUI.ctx)
        view.drawGeometry([sceneUI], 0, 1)
      }

      view.drawGeometry(styleContexts, 1)
      if (!isRunning && state.seek.index != null) {
        geometry.drawFocus(sceneUI.ctx, state.seek.index)
      }

      let didResizeBuffer = false
      styleContexts.forEach((context) => {
        if (context.lines.state.cursor.element > context.bufferSize) {
          const nextSize = context.bufferSize =
            Math.min(context.bufferSize * 2, MAX_UINT16_VALUE)
          context.lines.resize(nextSize)
          console.log('resize lines buffer', context.index, nextSize)
          didResizeBuffer = true
        }
      })
      if (didResizeBuffer) return

      // TODO: Separate UI and scene line geometry
      view.renderClearRect()
      cameras.scene.setup({
        offset: vec2.add(scratchVec2A, offset, panOffset),
        scale: scale + zoomOffset
      }, () => {
        view.renderLines()
        view.renderUI()
      })
      // cameras.ui.setup(() => {
      // })
    },

    renderClearRect () {
      const { drawRect } = renderer
      state.renderer.drawCalls++
      drawRect({
        color: [0.06, 0.08, 0.084, 0.15]
      })
    },

    renderLines () {
      const { styleContexts } = scene
      const { scale } = state.viewport
      const { zoomOffset } = state.drag
      const { isRunning } = state.simulation
      const { polarIterations } = state.controls
      const { lineStyles } = state.renderer

      const model = mat4.identity(scratchMat4A)
      const polarAlpha = isRunning ? 1 : 0.025
      const polarStep = Math.PI * 2 / polarIterations

      styleContexts.forEach(({ index, lines }) => {
        const style = lineStyles[index]
        const instances = range(polarIterations).map((index) => {
          return {
            angle: index * polarStep,
            angleAlpha: index === 0 ? 1 : polarAlpha,
            model,
            diffuseMap: style.diffuseMap,
            hatchAlpha: style.hatchAlpha,
            tint: style.tint,
            thickness: style.thickness * (scale + zoomOffset),
            miterLimit: 4
          }
        })
        state.renderer.drawCalls += instances.length
        lines.draw(instances)
      })
    },

    renderUI () {
      const { lines } = sceneUI
      const model = mat4.identity(scratchMat4A)

      lines.draw({
        model,
        tint: [1, 1, 1, 1],
        thickness: 1,
        miterLimit: 4
      })
    },

    drawGeometry (styleContexts, segmentStart, segmentCount) {
      geometry.drawSegments(styleContexts, segmentStart, segmentCount)
      geometry.drawSegmentsCurves(styleContexts, segmentStart, segmentCount)
    },

    drawEditorUI (ctx) {
      if (state.simulation.isRunning) return
      const { center } = state.viewport
      const { lineWidth } = state.geometry
      const offset = 20

      ctx.save()
      ctx.translate(-center[0], -center[1])

      ctx.globalAlpha = 0.9
      ctx.strokeStyle = '#111111'
      ctx.lineWidth = LINE_WIDTH[lineWidth]

      ctx.beginPath()
      ctx.moveTo(offset, offset)
      ctx.lineTo(offset + 40, offset)
      ctx.stroke()

      ctx.restore()
    },

    drawSimulatorUI (ctx) {
      if (!state.simulation.isRunning) return
      const { tick } = state.simulation
      const { center, size } = state.viewport

      const offsetA = 6 + Math.sin(tick * 0.02) * 2
      const offsetB = 10 + Math.sin(tick * 0.02) * 2

      ctx.save()
      ctx.translate(-center[0], -center[1])

      ctx.globalAlpha = 0.4
      ctx.strokeStyle = '#58BAA4'

      ctx.lineWidth = 3
      ctx.strokeRect(offsetA, offsetA,
        size[0] - offsetA * 2, size[1] - offsetA * 2)

      ctx.lineWidth = 1
      ctx.strokeRect(offsetB, offsetB,
        size[0] - offsetB * 2, size[1] - offsetB * 2)

      ctx.restore()
    },

    drawSimulatorOriginUI (ctx) {
      if (!state.simulation.isRunning) return
      const { diffusor, rotator } = state.simulation

      ctx.save()
      ctx.globalAlpha = 0.6
      ctx.strokeStyle = '#58BAA4'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.arc(0, 0, 14, 0, -rotator.intensity * 100 * Math.PI, rotator.intensity > 0)
      ctx.stroke()

      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, 14 + diffusor.intensity * 100 * 8, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    },

    drawSimulatorForceUI (ctx, baseRadius, alpha) {
      if (!state.simulation.isRunning) return
      const { nudge } = state.simulation
      const { move } = state.seek

      ctx.save()
      ctx.globalAlpha = 0.6 * alpha
      ctx.strokeStyle = '#58BAA4'

      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(move[0], move[1],
        baseRadius + nudge.intensity * 1.5,
        0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    },

    drawOrigin (ctx) {
      const size = 6

      ctx.save()
      ctx.globalAlpha = 0.8
      ctx.strokeStyle = '#222222'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(0, size)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-size, 0)
      ctx.lineTo(size, 0)
      ctx.stroke()

      ctx.restore()
    },

    drawOriginTick (ctx) {
      const { tick } = state.simulation

      ctx.save()
      ctx.globalAlpha = 0.8
      ctx.strokeStyle = '#222222'
      ctx.lineWidth = 2
      ctx.rotate(tick * 0.02)

      ctx.beginPath()
      ctx.arc(0, 0, 8, 0, Math.PI * 0.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, 8, Math.PI, Math.PI * 1.5)
      ctx.stroke()

      ctx.restore()
    }
  }

  tasks.add(view, 'update')
  tasks.add(view, 'render')
  view.inject()
}

export default {
  name: 'editor-compositor',

  data () {
    return {}
  },

  mounted () {
    const { $el, $electron } = this
    mountCompositor($el, $electron)
  },

  components: {},
  methods: {}
}
</script>
