export function createTaskManager (...queueNames) {
  const tasks = {}
  const responders = {}

  queueNames.forEach((name) => {
    tasks[name] = []
  })

  // Sync

  tasks.add = (context, queueName, name_) => {
    const name = name_ || queueName
    const queue = tasks[queueName]
    const fn = context[name] || context
    queue.push({
      context, fn
    })
  }

  tasks.run = (queueName, ...args) => {
    tasks[queueName].forEach((task) => {
      task.fn.apply(task.context, args)
    })
  }

  // Async

  tasks.defer = (context, queueName, name_) => {
    const name = name_ || queueName
    const queue = tasks[queueName]
    const fn = context[name] || context
    return new Promise((resolve, reject) => {
      queue.push({
        context, fn, resolve, reject
      })
    })
  }

  tasks.flush = (queueName, ...args) => {
    return Promise.all(tasks[queueName].map((task) => {
      return task.fn.apply(task.context, args).then((res) => (
        task.resolve(res)
      ))
    })).then(() => {
      tasks[queueName].length = 0
    })
  }

  // Request / Response

  tasks.registerResponder = (responderName, context, fn) => {
    responders[responderName] = {
      context,
      fn
    }
  }

  tasks.requestSync = (responderName, ...args) => {
    const responder = responders[responderName]
    if (!responder) throw new Error(`No responder for ${responderName}`)
    return responder.fn.apply(responder.context, args)
  }

  return tasks
}
