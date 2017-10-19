// Linear mapping from range <a1, a2> to range <b1, b2>
export function mapLinear (a1, a2, b1, b2, x) {
  return b1 + (x - a1) * (b2 - b1) / (a2 - a1)
}

export function clamp (min, max, x) {
  return Math.min(max, Math.max(min, x))
}

export function lerp (a, b, t) {
  return (1 - t) * a + t * b
}
