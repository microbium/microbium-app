import { vec2, mat2d } from 'gl-matrix'

import {
  BoundingPlaneConstraint,
  DistanceConstraint,
  PointConstraint,
  ParticleSystem
} from 'particulate'

import { logger } from '@/utils/logger'

import { RepulsorForce } from '@/physics/forces/RepulsorForce'
import { RotatorForce } from '@/physics/forces/RotatorForce'

export function createSimulationController (tasks, state, renderer) {
  const scratchVec2A = vec2.create()
  const scratchMat2dA = mat2d.create()

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
        const lines = tasks.requestSync('geometry.expandIndicesToLines', segment.indices)
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
      const { polarIterations } = state.controls.modifiers

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

  tasks.registerResponder('simulation.toggle',
    simulation, simulation.toggle)

  return simulation
}
