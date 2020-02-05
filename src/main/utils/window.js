const { round } = Math

export function fitRect (rect, { padding, aspect, alignX, alignY }) {
  const displayAspect = rect.width / rect.height
  const transform = {}

  if (displayAspect > aspect) {
    transform.height = rect.height - padding * 2
    transform.width = round(transform.height * aspect)
    transform.x = round((rect.width - transform.width) * alignX)
    transform.y = padding
  } else {
    transform.width = rect.width - padding * 2
    transform.height = round(transform.width / aspect)
    transform.x = padding
    transform.y = round((rect.height - transform.height) * alignY)
  }

  return transform
}
