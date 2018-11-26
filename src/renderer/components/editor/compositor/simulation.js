import { vec2 } from 'gl-matrix'

import {
  BoundingPlaneConstraint,
  PointConstraint,
  ParticleSystem
} from 'particulate'

import { distance2 } from '@renderer/utils/array'
import { mapLinear, radialPosition } from '@renderer/utils/math'
import { logger } from '@renderer/utils/logger'

import { ViscousDistanceConstraint } from '@renderer/physics/constraints/ViscousDistanceConstraint'
import { RepulsorForce } from '@renderer/physics/forces/RepulsorForce'
import { RotatorForce } from '@renderer/physics/forces/RotatorForce'

export function createSimulationController (tasks, state, renderer) {
  const scratchVec2A = vec2.create()
  const scratchVec2B = vec2.create()
  const scratchVec2C = vec2.create()
  const scratchVec2D = vec2.create()

  const simulation = {
    // TODO: Prevent running simulation while still editing segment
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

    togglePause () {
      const { isPaused } = state.simulation
      state.simulation.isPaused = !isPaused
      state.renderer.updateOverlapTick = 0
    },

    // Create

    createFromGeometry () {
      const { constraintGroups, forces, styles } = state.controls
      const { segments, vertices } = state.geometry

      // Initialize particle system positions and weights
      const count = vertices.length
      const system = ParticleSystem.create(count, 2)
      simulation.initializeParticles(system, vertices, segments, styles)

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

    // Set particle positions / weights
    // NOTE: Weights in system are inverted ...
    // TODO: Maybe update weights when styles change
    initializeParticles (system, vertices, segments, styles) {
      const accumulatedWeights = new Array(vertices.length).fill(0)
      let maxWeight = 0

      segments.forEach((segment) => {
        const {
          indices, styleIndex,
          strokeWidth, strokeWidthModulations
        } = segment
        const { strokeWidthMod } = styles[styleIndex]

        indices.forEach((index, i) => {
          const weight = strokeWidth +
            strokeWidth * strokeWidthMod * strokeWidthModulations[i]
          const accumWeight = accumulatedWeights[index] += weight
          if (accumWeight > maxWeight) maxWeight = accumWeight
        })
      })

      vertices.forEach((vert, i) => {
        const weight = mapLinear(0, maxWeight, 4, 1,
          accumulatedWeights[i])
        system.setPosition(i, vert[0], vert[1], 0)
        system.setWeight(i, weight)
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
      const { lineLengths, isComplete } = segment
      if (!isComplete) return
      const lines = simulation.expandIndicesToLines(segment.indices)
      const constraints = []

      lines.forEach((line, i) => {
        const distance = lineLengths[i]
        const constraint = ViscousDistanceConstraint.create(
          [distance * (1 - slipTolerance), distance], line)

        system.addConstraint(constraint)
        constraints.push({
          distance,
          constraint
        })
      })

      group.push({
        localTime: 0,
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

    update (tick, speed) {
      simulation.updateEngines(speed)
      simulation.updateForces(speed)
      state.simulationSystem.tick(speed)
      simulation.syncGeometry()
    },

    // TODO: Enable extending beyond base segment size
    updateEngines (speed) {
      const { constraintGroups } = state.controls
      const { engines } = state.simulationConstraintGroups

      engines.forEach((engine) => {
        const { segment, constraints, localTime } = engine
        const config = constraintGroups[segment.constraintIndex]
        const { slipTolerance, engineCadence, engineFlex } = config

        const nextLocalTime = localTime + engineCadence * speed
        const distanceScale = Math.sin(nextLocalTime) *
          mapLinear(0, 1, 0, 0.5, engineFlex) +
          mapLinear(0, 1, 1, 0.5, engineFlex)

        engine.localTime = nextLocalTime
        constraints.forEach(({distance, constraint}) => {
          const nextDistance = distance * distanceScale
          constraint.setDistance(nextDistance * (1 - slipTolerance), nextDistance)
        })
      })
    },

    computeForceRadius (baseRadius) {
      return baseRadius * baseRadius
    },

    computePolarOffset (basePolarOffset) {
      return basePolarOffset * basePolarOffset
    },

    updateForces (speed) {
      const { points } = state.simulationForces
      const { tick } = state.simulation
      const { forces } = state.controls
      const { isDragging, down } = state.drag
      const { move, velocity } = state.seek
      const { polarIterations, mirror } = state.controls.modifiers

      // TODO: Improve pointer force polar distribution
      const hasMirror = mirror.intensityFactor > 0
      const mirrorInterval = hasMirror ? 2 : 1
      const shouldApplyMirror = hasMirror && tick % 2 === 0

      const angleStep = Math.PI * 2 / polarIterations
      const angleIndex = Math.floor((tick / mirrorInterval) % polarIterations)
      const rotationAngle = angleStep * angleIndex

      points.forEach((item, i) => {
        const config = forces[i]
        const {
          positionTypeIndex, intensityTypeIndex, radius,
          polarAngle, polarOffset
        } = config
        const { position, force } = item
        const intensity = positionTypeIndex === 1
          ? config.intensity * 10
          : config.intensity * 3

        force.setRadius(
          simulation.computeForceRadius(radius))

        switch (positionTypeIndex) {
          case 0:
            // Static
            const polarOffsetVec = vec2.set(scratchVec2B,
              simulation.computePolarOffset(polarOffset), 0)
            const polarRotationAngle = polarAngle / 180 * Math.PI
            const polarPosition = radialPosition(scratchVec2C,
              polarOffsetVec, polarRotationAngle)
            const polarTickPosition = radialPosition(scratchVec2D,
              polarOffsetVec, polarRotationAngle + rotationAngle)

            if (shouldApplyMirror) polarTickPosition[0] *= -1
            vec2.copy(position, polarPosition)
            force.set(polarTickPosition[0], polarTickPosition[1], 0)
            break
          case 1:
            // Pointer
            const pointerPosition = isDragging ? down : move
            const pointerForcePosition = radialPosition(scratchVec2A,
              pointerPosition, rotationAngle)

            if (shouldApplyMirror) pointerForcePosition[0] *= -1
            vec2.copy(position, pointerPosition)
            force.set(pointerForcePosition[0], pointerForcePosition[1], 0)
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
    'togglePause',
    'computeParticleVelocities'
  ], simulation, 'simulation')

  return simulation
}
