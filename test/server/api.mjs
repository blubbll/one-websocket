import cors from 'cors'
import express from 'express'

import TestwebSocketServer from './websocket-server'

const httpServer = express()

const HTTP_SERVER_PORT = 5151
const WEBSOCKET_SERVER_PORT = 6161

const webSocketServer = new TestwebSocketServer(WEBSOCKET_SERVER_PORT)

httpServer.listen(HTTP_SERVER_PORT, () => console.log(`Http server listening on port: ${HTTP_SERVER_PORT}!`))
httpServer.use(cors())

httpServer.post('/start', async function (req, res) {
  webSocketServer.reset()
  if (!webSocketServer.isRunning()) {
    await webSocketServer.start()
  }
  res.sendStatus(200)
})

httpServer.post('/stop', async function (req, res) {
  if (webSocketServer.isRunning()) {
    await webSocketServer.stop()
  }
  res.sendStatus(200)
})

httpServer.post('/reset', async function (req, res) {
  if (!webSocketServer.isRunning()) {
    await webSocketServer.start()
  }
  webSocketServer.reset()
  res.sendStatus(200)
})

httpServer.post('/disconnect-all', async function (req, res) {
  webSocketServer.disconnectAll()
  res.sendStatus(200)
})

httpServer.get('/messages-received', async function (req, res) {
  const response = {
    messagesReceived: webSocketServer.messagesReceived()
  }
  logResponse(response)
  res.send(response)
})

httpServer.get('/connect-attempts', async function (req, res) {
  const response = {
    connectAttempts: webSocketServer.connectAttempts()
  }
  logResponse(response)
  res.send(response)
})

httpServer.get('/connected-count', async function (req, res) {
  const response = {
    connectedCount: webSocketServer.connectedCount()
  }
  logResponse(response)
  res.send(response)
})

function logResponse (response) {
  console.log('sending response: %o', response)
}
