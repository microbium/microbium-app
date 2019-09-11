export function createGroupPool ({ createItem }) {
  const pool = []
  const groups = {}

  function getGroup (count) {
    if (groups[count]) {
      return groups[count]
    }

    const nextGroup = new Array(count)
    for (let i = 0; i < count; i++) {
      if (pool.length > i) {
        nextGroup[i] = pool[i]
      } else {
        const nextItem = createItem()
        nextGroup[i] = nextItem
        pool.push(nextItem)
      }
    }

    groups[count] = nextGroup
    return nextGroup
  }

  return {
    groups,
    getGroup
  }
}

export function createKeyedPool ({ createItem }) {
  const pool = []
  const cache = {}

  function get (name) {
    if (cache[name]) {
      return cache[name]
    }

    const nextItem = createItem()
    cache[name] = nextItem
    pool.push(nextItem)
    return nextItem
  }

  return {
    cache,
    get
  }
}
