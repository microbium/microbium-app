export function createLoop (context_, update_, render_, delta) {
  const instance = {}
  const update = context_ ? context_[update_] : update_
  const render = context_ ? context_[render_] : render_
  const context = context_ || instance

  const targetDelta = delta || (1 / 60 * 1000)
  const maxDelta = targetDelta
  let stepTime = 0

  let isLooping = false
  let lastTime

  function animateStep (delta) {
    stepTime += delta
    let steps = Math.floor(stepTime / targetDelta)

    if (steps > 0) {
      stepTime -= steps * targetDelta
      instance.didUpdate = true
    }

    while (steps > 0) {
      update.call(context, targetDelta)
      steps--
    }

    const stepProgress = stepTime / targetDelta
    render.call(context, targetDelta, stepProgress)
  }

  function animate () {
    if (!isLooping) { return }
    const time = Date.now()
    const delta = Math.min(maxDelta, time - lastTime)

    instance.didUpdate = false
    animateStep(delta)
    window.requestAnimationFrame(animate)
    lastTime = time
  }

  instance.stop = () => {
    isLooping = false
  }

  instance.start = () => {
    lastTime = Date.now()
    isLooping = true
    animate()
  }

  instance.toggle = () => {
    if (isLooping) instance.stop()
    else instance.start()
  }

  return instance
}
