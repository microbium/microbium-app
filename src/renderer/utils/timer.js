function createTimer () {
  const timeBegin = {}
  const stats = {}

  return {
    reset () {
      Object.keys(stats).forEach((key) => {
        stats[key] = 0
      })
    },

    begin (name) {
      timeBegin[name] = performance.now()
    },

    end (name) {
      const curr = stats[name] || 0
      const next = performance.now() - timeBegin[name]
      return (stats[name] = curr + (next - curr) * 0.1)
    },

    get (name, precision) {
      const val = stats[name]
      return (val || 0).toFixed(precision)
    }
  }
}

const timer = createTimer()
export { timer }
