const METHODS = [
  'log',
  'info',
  'time',
  'timeEnd'
]

function noop () {}

function ensureConsole () {
  if (window.console) return window.console
  const noopConsole = {}
  METHODS.forEach((name) => {
    noopConsole[name] = noop
  })
  return noopConsole
}

function createLogger () {
  const _console = ensureConsole()
  const logger = {}
  METHODS.forEach((name) => {
    logger[name] = (...args) => _console[name](...args)
  })
  logger.logHash = (name, hash) => {
    Object.keys(hash).forEach((key) => {
      _console.log(`|  ${key}: ${hash[key]}`)
    })
    _console.log(name)
  }
  return logger
}

const logger = createLogger()
export { logger }
