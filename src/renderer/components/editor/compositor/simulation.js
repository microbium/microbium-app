import { vec2, mat2d } from 'gl-matrix'
import { distance2 } from '@/utils/array'

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
      } else {
        simulation.destroy()
      }
    },

    createFromGeometry () {
      const { segments, vertices } = state.geometry
      const count = vertices.length
      const system = ParticleSystem.create(count, 2)

      vertices.forEach((vert, i) => {
        system.setPosition(i, vert[0], vert[1], 0)
      })

      segments.forEach((segment) => {
        const { indices, physicsTypeIndex, isClosed } = segment

        switch (physicsTypeIndex) {
          // Static (pinned) segment
          case 0:
            indices.forEach((index, i) => {
              if (isClosed && i === 0) return
              const position = system.getPosition(index, [])
              const pin = PointConstraint.create(position, index)
              system.addPinConstraint(pin)
            })
            break

          // Dynamic segment
          case 1:
            const lines = simulation.expandIndicesToLines(indices)
            lines.forEach((line) => {
              const distance = vec2.distance(
                vertices[line[0]],
                vertices[line[1]])
              const constraint = DistanceConstraint.create(
                [distance * 0.95, distance], line)
              system.addConstraint(constraint)
            })
            break
        }
      })

      const bounds = BoundingPlaneConstraint.create(
        [0, 0, 0], [0, 0, 1], Infinity)
      bounds.friction = 0.01
      system.addConstraint(bounds)

      const nudge = RepulsorForce.create([0, 0, 0])
      const diffusor = RepulsorForce.create([0, 0, 0])
      const rotator = RotatorForce.create([0, 0, 0])
      system.addForce(nudge)
      system.addForce(diffusor)
      system.addForce(rotator)

      const forces = [nudge, diffusor, rotator]

      const pinConstraintCount = simulation.countConstraints(
        system, 'pinConstraints')
      const localConstraintCount = simulation.countConstraints(
        system, 'localConstraints')

      // TODO: Cleanup specific name references
      // OPTIM: Prevent setting up vue observers on simulation instances
      Object.assign(state.simulation, {
        system,
        pinConstraintCount,
        localConstraintCount,
        bounds,
        forces,
        nudge,
        diffusor,
        rotator
      })
    },

    expandIndicesToLines (indices) {
      return indices.slice(0, -1).reduce((all, v, i) => {
        const a = indices[i]
        const b = indices[i + 1]
        all.push([a, b])
        return all
      }, [])
    },

    countConstraints (system, name) {
      return system[`_${name}`]
        .reduce((accum, constraint) => accum + constraint._count, 0)
    },

    destroy () {
      Object.assign(state.simulation, {
        system: null,
        pinConstraintCount: null,
        localConstraintCount: null,
        bounds: null,
        forces: null,
        nudge: null,
        diffusor: null,
        rotator: null
      })
    },

    updateForces () {
      const { forces, tick } = state.simulation
      const { forces: cforces, forceScales } = state.controls
      const { move, velocity } = state.seek
      const { polarIterations } = state.controls.modifiers

      const angleStep = Math.PI * 2 / polarIterations
      const angleIndex = tick % polarIterations
      const rotation = mat2d.fromRotation(scratchMat2dA, angleStep * angleIndex)
      const nudgePosition = vec2.transformMat2d(scratchVec2A, move, rotation)

      forces.forEach((force, i) => {
        const { id, radius, radiusScaleIndex, intensity } = cforces[i]
        force.setRadius(radius * forceScales[radiusScaleIndex].value)
        if (id === 'nudge') {
          force.set(nudgePosition[0], nudgePosition[1], 0)
          force.intensity = Math.min(velocity, 3) * intensity * 10 + 2
        } else {
          force.intensity = Math.sin(tick * 0.01) * intensity * 0.1
        }
      })
    },

    syncGeometry () {
      const { positions } = state.simulation.system
      const { vertices } = state.geometry

      vertices.forEach((vert, i) => {
        const ix = i * 3
        const iy = ix + 1
        vec2.set(vert, positions[ix], positions[iy])
      })
    },

    computeParticleVelocities () {
      const { system } = state.simulation
      if (!system) return null

      const { positions, positionsPrev } = system
      const velocities = []
      const timeFactor = 1// 1 / (1 / 60 * 1000)

      system.each((index) => {
        const distance = distance2(positions, positionsPrev, index, index)
        velocities.push(distance * timeFactor)
      })

      return velocities
    }
  }

  tasks.registerResponders([
    'toggle',
    'computeParticleVelocities'
  ], simulation, 'simulation')

  return simulation
}
