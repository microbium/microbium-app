import { vec2 } from 'gl-matrix'

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
      const width = window.innerWidth
      const height = window.innerHeight

      vec2.set(stateViewport.size, width, height)
      vec2.set(stateViewport.center, width / 2, height / 2)
      vec2.set(stateViewport.resolution,
        Math.round(stateViewport.size[0] * stateViewport.pixelRatio),
        Math.round(stateViewport.size[1] * stateViewport.pixelRatio))
      stateViewport.didResize = true
      tasks.run('resize', event)
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
          stateDrag.shouldZoom = true
          break
        case 'ShiftLeft':
          stateInput.shift = true
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
          stateDrag.shouldZoom = false
          break
        case 'ShiftLeft':
          stateInput.shift = false
          break
      }
    },

    keyCommand (event, data) {
      const { code } = data

      switch (code) {
        case 'Space':
          requestSync('simulation.toggle')
          break
        case 'X':
          requestSync('geometry.deleteLastVertex')
          break
        case 'C':
          requestSync('geometry.completeActiveSegmentPopCursor')
          requestSync('drag.cancelDraw')
          break
        case 'Cmd+Backspace':
          requestSync('geometry.deleteLastSegment')
          break
        case 'Cmd+/':
          viewport.toggleStats()
          break
      }
    },

    message (event, data) {
      switch (data.type) {
        case 'UPDATE_CONTROLS':
          state.controls[data.group] = data.value
          break
      }
    }
  }

  tasks.registerResponder('viewport.projectScreen',
    viewport, viewport.projectScreen)

  return viewport
}
