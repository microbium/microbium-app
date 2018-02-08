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
  const scratchVec2B = vec2.create()
  const scratchVec2C = vec2.create()
  const scratchVec2D = vec2.create()
  const scratchMat2dA = mat2d.create()
  const scratchMat2dB = mat2d.create()
  const scratchMat2dC = mat2d.create()

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
      const { constraintGroups, forces } = state.controls
      const { segments, vertices } = state.geometry
      const count = vertices.length
      const system = ParticleSystem.create(count, 2)

      // Set particle positions
      vertices.forEach((vert, i) => {
        system.setPosition(i, vert[0], vert[1], 0)
      })

      const { stickGroups, engineGroups } = simulation
        .createSegmentConstraints(system, segments, constraintGroups)
      const { boundsGroups } = simulation.createGlobalConstraints(system)
      const { pointForces } = simulation.createForces(system, forces)

      const forcesCount = simulation.countForces(system)
      const pinConstraintCount = simulation.countConstraints(
        system, 'pinConstraints')
      const localConstraintCount = simulation.countConstraints(
        system, 'localConstraints')

      // TODO: Cleanup specific name references
      // OPTIM: Minimize / cleanup vue reactive state ...
      state.simulationSystem = system
      state.simulationConstraintGroups = {
        bounds: boundsGroups,
        sticks: stickGroups,
        engines: engineGroups
      }
      state.simulationForces = {
        points: pointForces
      }
      Object.assign(state.simulation, {
        forcesCount,
        pinConstraintCount,
        localConstraintCount
      })
    },

    createGlobalConstraints (system) {
      const bounds = BoundingPlaneConstraint.create(
        [0, 0, 0], [0, 0, 1], Infinity)

      bounds.friction = 0.01
      system.addConstraint(bounds)

      return {
        boundsGroups: [bounds]
      }
    },

    createSegmentConstraints (system, segments, constraintGroups) {
      const stickGroups = []
      const engineGroups = []

      segments.forEach((segment) => {
        const config = constraintGroups[segment.constraintIndex]
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

      return {
        stickGroups,
        engineGroups
      }
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
      const { lineLengths } = segment
      const lines = simulation.expandIndicesToLines(segment.indices)
      const constraints = []

      lines.forEach((line, i) => {
        const distance = lineLengths[i]
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

    createForces (system, forces) {
      const pointForces = []

      forces.forEach((config) => {
        switch (config.typeIndex) {
          case 0:
            // Attractor / Repulsor
            this.createAttractorRepulsorForce(system,
              config, pointForces)
            break
          case 1:
            // Rotator
            this.createRotatorForce(system,
              config, pointForces)
            break
        }
      })

      return {
        pointForces
      }
    },

    createAttractorRepulsorForce (system, config, group) {
      const force = RepulsorForce.create([0, 0, 0])
      system.addForce(force)
      group.push({
        position: vec2.create(),
        force
      })
    },

    createRotatorForce (system, config, group) {
      const force = RotatorForce.create([0, 0, 0])
      system.addForce(force)
      group.push({
        position: vec2.create(),
        force
      })
    },

    countForces (system) {
      return system._forces.length
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
      const { points } = state.simulationForces
      const { tick } = state.simulation
      const { forces, forceScales } = state.controls
      const { move, velocity } = state.seek
      const { polarIterations } = state.controls.modifiers

      // TODO: Improve pointer force polar distribution
      const angleStep = Math.PI * 2 / polarIterations
      const angleIndex = tick % polarIterations
      const rotation = mat2d.fromRotation(scratchMat2dA, angleStep * angleIndex)
      const pointerPosition = vec2.transformMat2d(scratchVec2A, move, rotation)

      points.forEach((item, i) => {
        const config = forces[i]
        const {
          positionTypeIndex, intensityTypeIndex,
          radius, radiusScaleIndex
        } = config
        const { position, force } = item
        const intensity = positionTypeIndex === 1
          ? config.intensity * 10
          : config.intensity * 3

        force.setRadius(radius * forceScales[radiusScaleIndex].value)

        switch (positionTypeIndex) {
          case 0:
            // Static
            const polarOffset = vec2.set(scratchVec2B, config.polarOffset, 0)
            const polarAngle = Math.PI * config.polarAngle / 180
            const polarRotation = mat2d.fromRotation(scratchMat2dB, polarAngle)
            const polarTickRotation = mat2d.fromRotation(scratchMat2dC,
              angleStep * angleIndex * polarAngle)

            const polarPosition = vec2.transformMat2d(scratchVec2C,
              polarOffset, polarRotation)
            const polarTickPosition = vec2.transformMat2d(scratchVec2D,
              polarOffset, polarTickRotation)

            vec2.copy(position, polarPosition)
            force.set(polarTickPosition[0], polarTickPosition[1], 0)
            break
          case 1:
            // Pointer
            vec2.copy(position, move)
            force.set(pointerPosition[0], pointerPosition[1], 0)
            break
        }

        switch (intensityTypeIndex) {
          case 0:
            // Static
            force.intensity = intensity
            break
          case 1:
            // Pointer Velocity
            force.intensity = Math.min(velocity, 3) * intensity + 2
            break
          case 2:
            // Ebb and Flow
            force.intensity = Math.sin(tick * 0.01) * intensity * 0.1
            break
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
