const RGB_FACTOR = 1 / 255

export function toVec4 (out, colr, hex, alpha) {
  let rgb = colr.fromHex(hex).toRgbArray()
  out[0] = rgb[0] * RGB_FACTOR
  out[1] = rgb[1] * RGB_FACTOR
  out[2] = rgb[2] * RGB_FACTOR
  out[3] = alpha
  return out
}
