import { vec2 } from 'gl-matrix'

export function createViewportController (tasks, state) {
  const { requestSync } = tasks
  let compositorContainer = null

  const viewport = {
    inject (containers) {
      compositorContainer = containers.compositor
      return Promise.resolve()
    },

    updateClassName () {
      compositorContainer.className = state.simulation.isRunning
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
          viewport.updateClassName()
          break
        case 'Cmd+Backspace':
          requestSync('geometry.deleteLastSegment')
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

  tasks.defer(viewport, 'inject')
  tasks.registerResponder('viewport.projectScreen',
    viewport, viewport.projectScreen)

  return viewport
}
