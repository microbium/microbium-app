const _map = Array.prototype.map

export function createArrayCursor (array) {
  return new ArrayCursor(array)
}

function ArrayCursor (array) {
  this.array = array
  this.cursor = 0
}

Object.assign(ArrayCursor.prototype, {
  push () {
    const { array } = this
    let { cursor } = this
    for (let i = 0; i < arguments.length; i++) {
      array[cursor++] = arguments[i]
    }
    this.cursor = cursor
  }
})

export function range (count) {
  const out = []
  for (let i = 0; i < count; i++) {
    out.push(i)
  }
  return out
}

export function map (arr, predicate) {
  return _map.call(arr, predicate)
}

export function flatten2 (arr, Ctor = Array) {
  const count = arr.length
  const out = new Ctor(count * 2)
  for (let i = 0; i < count; i++) {
    out[i * 2] = arr[i][0]
    out[i * 2 + 1] = arr[i][1]
  }
  return out
}

export function expand2 (arr, Ctor = Array) {
  const count = arr.length / 2
  const out = new Array(count)
  for (let i = 0; i < count; i++) {
    const v = new Ctor(2)
    v[0] = arr[i * 2]
    v[1] = arr[i * 2 + 1]
    out[i] = v
  }
  return out
}
