import { vec2, mat2d } from 'gl-matrix'
import { distance2 } from '@/utils/array'
import { mapLinear } from '@/utils/math'

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

    // Create

    createFromGeometry () {
      const { constraints } = state.controls
      const { segments, vertices } = state.geometry
      const count = vertices.length
      const system = ParticleSystem.create(count, 2)
      const stickGroups = []
      const engineGroups = []

      // Set particle positions
      vertices.forEach((vert, i) => {
        system.setPosition(i, vert[0], vert[1], 0)
      })

      // Create segment constraints
      segments.forEach((segment) => {
        const config = constraints[segment.constraintIndex]
        switch (config.typeIndex) {
          case 0:
            // Pin
            this.createStaticSegment(system,
              segment, config)
            break
          case 1:
            // Stick
            this.createDynamicSegment(system,
              segment, config, stickGroups)
            break
          case 2:
            // Engine
            this.createDynamicSegment(system,
              segment, config, engineGroups)
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

      const forcesCount = forces.length
      const pinConstraintCount = simulation.countConstraints(
        system, 'pinConstraints')
      const localConstraintCount = simulation.countConstraints(
        system, 'localConstraints')

      // TODO: Cleanup specific name references
      // OPTIM: Minimize / cleanup vue reactive state ...
      state.simulationSystem = system
      state.simulationConstraintGroups = {
        sticks: stickGroups,
        engines: engineGroups
      }
      state.simulationForces = {
        all: forces,
        nudge,
        diffusor,
        rotator
      }
      Object.assign(state.simulation, {
        forcesCount,
        pinConstraintCount,
        localConstraintCount
      })
    },

    createStaticSegment (system, segment, config) {
      segment.indices.forEach((index, i) => {
        if (segment.isClosed && i === 0) return
        const position = system.getPosition(index, [])
        const pin = PointConstraint.create(position, index)
        system.addPinConstraint(pin)
      })
    },

    createDynamicSegment (system, segment, config, group) {
      const { slipTolerance } = config
      const lines = simulation.expandIndicesToLines(segment.indices)
      const constraints = []

      lines.forEach((line) => {
        const distance = system.getDistance(line[0], line[1])
        const constraint = DistanceConstraint.create(
          [distance * (1 - slipTolerance), distance], line)

        system.addConstraint(constraint)
        constraints.push({
          distance,
          constraint
        })
      })

      group.push({
        segment,
        constraints
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
      state.simulationSystem = null
      state.simulationConstraintGroups = null
      state.simulationForces = null
      Object.assign(state.simulation, {
        forcesCount: null,
        pinConstraintCount: null,
        localConstraintCount: null
      })
    },

    // Update

    update (tick) {
      simulation.updateEngines()
      simulation.updateForces()
      state.simulationSystem.tick(1)
      simulation.syncGeometry()
    },

    // TODO: Enable extending beyond base segment size
    updateEngines () {
      const { constraints: constraintConfigs } = state.controls
      const { tick } = state.simulation
      const { engines } = state.simulationConstraintGroups

      engines.forEach(({segment, constraints}) => {
        const config = constraintConfigs[segment.constraintIndex]
        const { slipTolerance, engineCadence, engineFlex } = config
        const distanceScale = Math.sin(tick * engineCadence) *
          mapLinear(0, 1, 0, 0.5, engineFlex) +
          mapLinear(0, 1, 1, 0.5, engineFlex)

        constraints.forEach(({distance, constraint}) => {
          const nextDistance = distance * distanceScale
          constraint.setDistance(nextDistance * (1 - slipTolerance), nextDistance)
        })
      })
    },

    updateForces () {
      const { all: allForces } = state.simulationForces
      const { tick } = state.simulation
      const { forces, forceScales } = state.controls
      const { move, velocity } = state.seek
      const { polarIterations } = state.controls.modifiers

      const angleStep = Math.PI * 2 / polarIterations
      const angleIndex = tick % polarIterations
      const rotation = mat2d.fromRotation(scratchMat2dA, angleStep * angleIndex)
      const nudgePosition = vec2.transformMat2d(scratchVec2A, move, rotation)

      allForces.forEach((force, i) => {
        const { id, radius, radiusScaleIndex, intensity } = forces[i]
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
      const { positions } = state.simulationSystem
      const { vertices } = state.geometry

      vertices.forEach((vert, i) => {
        const ix = i * 3
        const iy = ix + 1
        vec2.set(vert, positions[ix], positions[iy])
      })
    },

    computeParticleVelocities () {
      const system = state.simulationSystem
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
