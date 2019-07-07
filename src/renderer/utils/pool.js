export function createGroupPool ({ createItem }) {
  let pool = []
  let groups = {}

  function getGroup (count) {
    if (groups[count]) {
      return groups[count]
    }

    let nextGroup = new Array(count)
    for (let i = 0; i < count; i++) {
      if (pool.length > i) {
        nextGroup[i] = pool[i]
      } else {
        let nextItem = createItem()
        nextGroup[i] = nextItem
        pool.push(nextItem)
      }
    }

    groups[count] = nextGroup
    return nextGroup
  }

  return {
    getGroup
  }
}

export function createKeyedPool ({ createItem }) {
  let pool = []
  let cache = {}

  function get (name) {
    if (cache[name]) {
      return cache[name]
    }

    let nextItem = createItem()
    cache[name] = nextItem
    pool.push(nextItem)
    return nextItem
  }

  return {
    get
  }
}
