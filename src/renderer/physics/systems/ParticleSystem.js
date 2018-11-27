import { ParticleSystem as BaseParticleSystem } from 'particulate'
import { inherit } from '@renderer/utils/ctor'

export { ParticleSystem }

function ParticleSystem (particles, iterations) {
  BaseParticleSystem.call(this, particles, iterations)
  this._engineConstraints = []
}

inherit(BaseParticleSystem, ParticleSystem, {
  addEngineConstraint (constraint) {
    this._engineConstraints.push(constraint)
  },

  satisfyConstraints () {
    const iterations = this._iterations
    const globals = this._globalConstraints
    const locals = this._localConstraints
    const pins = this._pinConstraints
    const engines = this._engineConstraints
    const globalCount = this._count
    const globalItemSize = 3

    for (let i = 0; i < iterations; i++) {
      this.satisfyConstraintGroup(globals, globalCount, globalItemSize)
      this.satisfyConstraintGroup(locals)
      if (engines.length) this.satisfyConstraintGroup(engines)
      if (pins.length) this.satisfyConstraintGroup(pins)
    }
  }
})
