'use strict'

const test = require('tape')

const common = require('../tools/common')
const Socket = require('../../')
const webSocketServerClient = require('../tools/websocket-server-client')

common.beforeEach()

test('connect event is emitted when a connection has been established', assert => {
  assert.plan(1)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', function () {
    assert.true(socket.isConnected, 'socket is connected')
    socket.destroy()
  })
  socket.on('warning', function () {
    assert.fail('warning event should not be emitted')
  })
})

common.beforeEach()

test('data event is emitted when the server echoes a message', assert => {
  assert.plan(1)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', function () {
    socket.send('1')
    socket.send('2')
    socket.send('3')
    socket.send('4')
  })

  const receivedMessages = []
  socket.on('data', function (data) {
    receivedMessages.push(data)
    if (receivedMessages.length === 4) {
      assert.deepEqual(receivedMessages, ['1', '2', '3', '4'])
      socket.destroy()
    }
  })
})

common.beforeEach()

test('warning event is emitted when the server is unreachable', async assert => {
  assert.plan(2)
  await webSocketServerClient.stop()
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('warning', function (err) {
    assert.true(err instanceof Error)
    assert.is(err.message, `WebSocket connection to "${common.WEBSOCKET_SERVER_URL}" failed`)
    socket.destroy()
  })
  socket.on('connect', () => assert.fail('connect event should not be emitted'))
  socket.on('data', () => assert.fail('data event should not be emitted'))
  socket.on('disconnect', () => assert.fail('disconnect event should not be emitted'))
})

common.beforeEach()

test('warning event is emitted when the server is shutdown while connected', assert => {
  assert.plan(3)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', () => {
    assert.pass('connect event emitted. shutting down websocket server')
    webSocketServerClient.stop()
  })
  socket.on('warning', function (err) {
    assert.true(err instanceof Error)
    assert.is(err.message, `WebSocket connection to "${common.WEBSOCKET_SERVER_URL}" failed`)
    socket.destroy()
  })
})

common.beforeEach()

test('disconnect event is emitted when the server closes the websocket', assert => {
  assert.plan(1)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', () => webSocketServerClient.disconnectAll())
  socket.on('disconnect', function () {
    assert.pass('disconnect event is emitted')
    socket.destroy()
  })
  socket.on('warning', () => assert.fail('warning event should not be emitted'))
})

common.beforeEach()

test('disconnect event is emitted before warning when the server is shutdown', assert => {
  assert.plan(1)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', () => webSocketServerClient.stop())
  socket.on('disconnect', function () {
    assert.pass('disconnect event is emitted')
    socket.destroy()
  })
  socket.on('warning', () => assert.fail('warning event should not be emitted'))
})
