import { vec2 } from 'gl-matrix'
import { clamp } from '@src/utils/math'
import { clampPixelRatio } from '@src/utils/screen'

export function createViewportController (tasks, state) {
  const { requestSync } = tasks

  const viewport = {
    toggleStats () {
      state.viewport.showStats = !state.viewport.showStats
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
      const { resolution, resolutionMax, size, center } = stateViewport
      const { pixelRatio } = state.controls.viewport

      const width = window.innerWidth
      const height = window.innerHeight
      vec2.set(size, width, height)
      vec2.set(center, width / 2, height / 2)

      const pixelRatioClamped = clampPixelRatio(
        size, pixelRatio, resolutionMax[0])
      const resWidth = Math.round(width * pixelRatioClamped)
      const resHeight = Math.round(height * pixelRatioClamped)
      vec2.set(resolution, resWidth, resHeight)

      stateViewport.pixelRatioClamped = pixelRatioClamped
      stateViewport.didResize = true

      tasks.run('resize', event)
    },

    wheel (event) {
      const { deltaY } = event
      const stateSeek = state.seek

      stateSeek.wheelOffset = clamp(-1, 1,
        stateSeek.wheelOffset + deltaY * 0.001)

      event.preventDefault()
    },

    keyDown (event) {
      const { code } = event
      const stateDrag = state.drag
      const stateInput = state.input

      switch (code) {
        case 'AltLeft':
          stateInput.alt = true
          stateDrag.shouldNavigate = true
          break
        case 'ControlLeft':
          stateInput.control = true
          break
        case 'ShiftLeft':
          stateInput.shift = true
          stateDrag.shouldZoom = true
          break
      }
    },

    keyUp (event) {
      const { code } = event
      const stateDrag = state.drag
      const stateInput = state.input

      switch (code) {
        case 'AltLeft':
          stateInput.alt = false
          stateDrag.shouldNavigate = false
          break
        case 'ControlLeft':
          stateInput.control = false
          break
        case 'ShiftLeft':
          stateInput.shift = false
          stateDrag.shouldZoom = false
          break
      }
    },

    command (data) {
      switch (data.action) {
        case 'SIMULATION_TOGGLE':
          requestSync('simulation.toggle')
          break
        case 'SIMULATION_TOGGLE_PAUSE':
          requestSync('simulation.togglePause')
          break
        case 'GEOMETRY_DELETE_LAST_VERTEX':
          requestSync('geometry.deleteLastVertex')
          break
        case 'GEOMETRY_COMPLETE_ACTIVE_SEGMENT':
          requestSync('geometry.completeActiveSegmentDiscardCursor')
          requestSync('drag.cancelDraw')
          break
        case 'GEOMETRY_DELETE_LAST_SEGMENT':
          requestSync('geometry.deleteLastSegment')
          break
        case 'VIEWPORT_TOGGLE_STATS': viewport.toggleStats()
          break
      }
    },

    message (data) {
      switch (data.type) {
        case 'UPDATE_CONTROLS':
          state.controls[data.group] = data.value
          state.renderer.needsUpdate = true
          break
        case 'MERGE_SEGMENT_PROP':
          requestSync('geometry.mergeSegmentProp',
            data.propName, data.indexFrom, data.indexTo)
          break
      }
    }
  }

  tasks.registerResponder('viewport.resize',
    viewport, viewport.resize)
  tasks.registerResponder('viewport.projectScreen',
    viewport, viewport.projectScreen)

  return viewport
}
