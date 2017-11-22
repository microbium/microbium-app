import { createSocket } from 'dgram'

export function createMessageSocket (port, address) {
  const socket = createSocket('udp4')

  function send (message) {
    socket.send(serializeMessage(message), port, address)
  }

  return {
    send
  }
}

function serializeMessage (message) {
  switch (typeof message) {
    case 'string':
      return message
    case 'object':
      return JSON.stringify(message)
  }
}
