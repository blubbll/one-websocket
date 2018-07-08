import ws from 'ws'

class WebSocketServer {
  constructor (port) {
    if (!Number.isInteger(port)) {
      throw new Error('port number is required')
    }
    this._connectAttempts = 0
    this._messagesReceived = []
    this._port = port
    this._socketServer = null
  }

  isRunning () {
    return this._socketServer != null
  }

  start () {
    const self = this
    if (self._socketServer != null) {
      throw new Error('start() cannot be called while the server is running')
    }
    self._socketServer = new ws.Server({ port: self._port })
    self._registerEventHandlers()

    const startedPromise = new Promise(function (resolve) {
      self._socketServer.on('listening', function () {
        console.log(`WebSocket server listening on port: ${self._port}!`)
        resolve()
      })
    })
    return startedPromise
  }

  stop () {
    const self = this
    if (self._socketServer == null) {
      throw new Error('start() must be invoked before stop()')
    }
    const stoppedPromise = new Promise(function (resolve) {
      self._socketServer.close(function () {

        resolve()
      })
      self._socketServer = null
    })
    return stoppedPromise
  }

  messagesReceived () {
    return this._messagesReceived.slice()
  }

  reset () {
    if (this._socketServer) {
      this._socketServer.clients.forEach(connectedSocket => connectedSocket.terminate())
    }
    this._messagesReceived = []
    this._connectAttempts = 0
  }

  disconnectAll () {
    this._socketServer.clients.forEach(connectedSocket => connectedSocket.terminate())
  }

  connectAttempts () {
    return this._connectAttempts
  }

  connectedCount () {
    return this.isRunning() ? this._socketServer.clients.size : 0
  }

  _registerEventHandlers () {
    const self = this

    const onConnection = function (connectedSocket) {
      console.log('received websocket connection')
      self._connectAttempts++
      connectedSocket.on('message', function (data) {
        if (Buffer.isBuffer(data)) {
          self._messagesReceived.push(Array.from(data))
        } else {
          self._messagesReceived.push(data)
        }

        connectedSocket.send(data)
      })
    }

    self._socketServer.on('connection', onConnection)
  }
}

export default WebSocketServer
