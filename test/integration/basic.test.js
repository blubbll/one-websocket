'use strict'

const test = require('tape')

const common = require('../tools/common')
const Socket = require('../../')
const webSocketServerClient = require('../tools/websocket-server-client')

common.beforeEach()

test('static ready state constants', assert => {
  assert.is(Socket.CONNECTING, 0)
  assert.is(Socket.OPEN, 1)
  assert.is(Socket.CLOSING, 2)
  assert.is(Socket.CLOSED, 3)
  assert.end()
})

common.beforeEach()

test('contructor throws an error when url is not a string', assert => {
  const inputs = [null, undefined, 0, true, function () {}, NaN, {}]
  inputs.forEach(input => {
    const error = common.tryCatch(() => new Socket(input))
    assert.is(error.message, 'WebSocket url must be of type string')
  })
  assert.end()
})

common.beforeEach()

test('contructor throws an error when url does not begin with ws:// or wss://', assert => {
  const error = common.tryCatch(() => new Socket('invalid://invalid-url'))
  assert.is(error.message, "WebSocket url must begin with either 'ws://' or 'wss://'")
  assert.end()
})

common.beforeEach()

test('ready state is updated', async assert => {
  const READY_STATES = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  }

  const socket = new Socket(common.WEBSOCKET_SERVER_URL)
  assert.is(socket.readyState, READY_STATES.CONNECTING)
  await common.wait(50)
  assert.is(socket.readyState, READY_STATES.OPEN)
  socket.destroy()
  // TODO
  // assert.is(socket.readyState(), READY_STATES.CLOSING)
  await common.wait(50)
  assert.is(socket.readyState, READY_STATES.CLOSED)
  assert.end()
})

common.beforeEach()

test('isConnected is true when a connection has been established', assert => {
  assert.plan(2)

  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', async function () {
    assert.true(socket.isConnected, 'isConnected() is true')
    const connectedCount = await webSocketServerClient.connectedCount()
    assert.is(connectedCount, 1)
    socket.destroy()
  })
})

common.beforeEach()

test('isConnected is false when the server cannot be reached', async assert => {
  const socket = new Socket('ws://localhost:65534')

  assert.false(socket.isConnected, 'isConnected is false')
  await common.wait(50)
  assert.false(socket.isConnected, 'isConnected is false after waiting')
  socket.destroy()
  assert.end()
})

common.beforeEach()

test('isDestroyed is false when the server cannot be reached', async assert => {
  const socket = new Socket('ws://localhost:65534')

  assert.false(socket.isDestroyed, 'isDestroyed is false')
  await common.wait(50)
  assert.false(socket.isDestroyed, 'isDestroyed is false after waiting')
  socket.destroy()
  assert.end()
})

common.beforeEach()

test('url returns the url specified in the constructor', assert => {
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)
  assert.is(socket.url, common.WEBSOCKET_SERVER_URL)
  socket.destroy()
  assert.end()
})

common.beforeEach()

test('socket continues to connect when options is null', assert => {
  assert.plan(1)
  const options = null
  const socket = new Socket(common.WEBSOCKET_SERVER_URL, options)

  socket.on('connect', function () {
    assert.true(socket.isConnected, 'socket is connected')
    socket.destroy()
  })
  socket.on('warning', function () {
    assert.fail('warning event should not be emitted')
  })
})
