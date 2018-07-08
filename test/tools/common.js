'use strict'

const test = require('tape')

const webSocketServerClient = require('./websocket-server-client')

const WEBSOCKET_SERVER_URL = 'ws://localhost:6161/'

function beforeEach () {
  test('before each', async assert => {
    console.log('before each :: resetting test WebSocket server')
    await webSocketServerClient.reset()
    assert.end()
  })
}

function tryCatch (cb) {
  try {
    cb()
  } catch (err) {
    return err
  }
}

function wait (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = {
  beforeEach,
  tryCatch,
  wait,
  WEBSOCKET_SERVER_URL
}
