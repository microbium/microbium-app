// Tween to target by difference factor
export function factorTween (name, context, target, factor) {
  const nextState = target[name]
  let state = context[name]
  if (state == null) state = context[name] = nextState
  context[name] += (nextState - state) * factor
  return context[name]
}

export const KEYS = {
  Vector3: ['x', 'y', 'z'],
  Spherical: ['radius', 'phi', 'theta']
}

export function factorTweenAll (keys, name, context, target, factor) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    factorTween(key, context[name], target[name], factor)
  }
}

// Tween to target by fixed step
export function stepTween (name, context, target, step) {
  const nextState = target[name]
  let state = context[name]
  if (state == null) state = context[name] = nextState
  if (state === nextState) return state
  const dir = state < nextState ? 1 : -1

  if ((nextState - state) * dir < step) {
    context[name] = nextState
    return state
  }

  context[name] += step * dir
  return context[name]
}

// Easing funcs from https://github.com/tweenjs/tween.js
// The MIT License
// Copyright (c) 2010-2012 Tween.js authors.

export function easeQuadraticIn (k) {
  return k * k
}

export function easeQuadraticOut (k) {
  return k * (2 - k)
}

export function easeQuadraticInOut (k) {
  if ((k *= 2) < 1) return 0.5 * k * k
  return -0.5 * (--k * (k - 2) - 1)
}

export function easeCubicIn (k) {
  return k * k * k
}

export function easeCubicOut (k) {
  return --k * k * k + 1
}

export function easeCubicInOut (k) {
  if ((k *= 2) < 1) return 0.5 * k * k
  return -0.5 * (--k * (k - 2) - 1)
}
