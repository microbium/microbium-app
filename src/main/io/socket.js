import { createSocket } from 'dgram'

function createMessageSocket (port, address) {
  const socket = createSocket('udp4')

  function send (message) {
    const messageStr = stringifyMessage(message)
    socket.send(messageStr, port, address)
  }

  return {
    send
  }
}

function stringifyMessage (message) {
  switch (typeof message) {
    case 'string':
      return message
    case 'object':
      return JSON.stringify(message)
  }
}

const ipcExternal = createMessageSocket(41234, 'localhost')

export {
  ipcExternal
}
