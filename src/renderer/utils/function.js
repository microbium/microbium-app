export function bindAll (context, ...names) {
  names.forEach((name) => {
    context[name] = context[name].bind(context)
  })
}

export function delayResolution (delay) {
  return new Promise((resolve) => {
    delayFrame(resolve, delay)
  })
}

export function delayFrame (fn, delay) {
  setTimeout(() => {
    window.requestAnimationFrame(fn)
  }, delay)
}

export function memoize (fn) {
  const cache = {}
  return (...args) => {
    const hash = args.map((v) => '' + v).join('') || '_'
    const value = cache[hash]
    if (value !== undefined) return value
    return (cache[hash] = fn.apply(null, args))
  }
}

export function memoizeAll (object) {
  const nextObject = {}
  Object.keys(object).forEach((key) => {
    nextObject[key] = memoize(object[key])
  })
  return nextObject
}

// Throttle and debounce funcs based on:
// jQuery throttle / debounce - v1.1 - 3/7/2010
// http://benalman.com/projects/jquery-throttle-debounce-plugin/
//
// Copyright (c) 2010 "Cowboy" Ben Alman
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/

export function throttle (delay, noTrailing, fn, debounceMode) {
  const state = {
    id: null,
    lastTime: 0
  }

  if (typeof noTrailing !== 'boolean') {
    debounceMode = fn
    fn = noTrailing
    noTrailing = undefined
  }

  return (...args) => {
    const elapsed = Date.now() - state.lastTime
    const exec = () => {
      state.lastTime = Date.now()
      fn.apply(this, args)
    }
    const clear = () => {
      state.id = null
    }

    if (debounceMode && !state.id) exec()
    if (state.id) clearTimeout(state.id)

    if (debounceMode == null && elapsed > delay) {
      exec()
    } else if (noTrailing !== true) {
      const nextAction = debounceMode ? clear : exec
      const nextDelay = debounceMode ? delay - elapsed : delay
      state.id = setTimeout(nextAction, nextDelay)
    }
  }
}

export function debounce (delay, immediate, fn) {
  return fn === undefined
    ? throttle(delay, immediate, false)
    : throttle(delay, fn, immediate !== false)
}
