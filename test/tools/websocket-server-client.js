'use strict'

const axios = require('axios')

const httpClient = axios.create({
  baseURL: 'http://localhost:5151/',
  validateStatus: status => status === 200
})

const webSocketServerClient = {
  start: () => httpClient.post('/start'),
  stop: () => httpClient.post('/stop'),
  reset: () => httpClient.post('/reset'),
  disconnectAll: () => httpClient.post('/disconnect-all'),
  messagesReceived: getMessagesReceived,
  connectAttempts: getConnectAttempts,
  connectedCount: getConnectedCount

}

function getConnectAttempts () {
  return new Promise(async resolve => {
    const result = await httpClient.get('/connect-attempts')
    resolve(result.data.connectAttempts)
  })
}

function getConnectedCount () {
  return new Promise(async resolve => {
    const result = await httpClient.get('/connected-count')
    resolve(result.data.connectedCount)
  })
}

function getMessagesReceived () {
  return new Promise(async resolve => {
    const result = await httpClient.get('/messages-received')
    resolve(result.data.messagesReceived)
  })
}

module.exports = webSocketServerClient
