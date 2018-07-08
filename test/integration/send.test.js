'use strict'

const test = require('tape')

const common = require('../tools/common')
const Socket = require('../../')
const webSocketServerClient = require('../tools/websocket-server-client')

common.beforeEach()

test('send() string', assert => {
  assert.plan(4)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', () => socket.send('{ "message": "Hello, World!." }'))
  socket.on('data', function (data) {
    const expectedMessage = '{ "message": "Hello, World!." }'
    assert.true(typeof data === 'string', 'data is a string')
    assert.is(data, expectedMessage)

    assertServerMessages(assert, [expectedMessage])
    socket.destroy()
  })
})

common.beforeEach()

test('send() ArrayBuffer', assert => {
  assert.plan(4)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', () => socket.send(new Uint8Array([1, 2, 3]).buffer))
  socket.on('data', function (data) {
    assert.true(data instanceof ArrayBuffer)

    const expectedMessage = new Uint8Array([1, 2, 3])
    const actualMessage = new Uint8Array(data)
    assert.deepEqual(actualMessage, expectedMessage)

    assertServerMessages(assert, [expectedMessage])
    socket.destroy()
  })
})

common.beforeEach()

test('send() Uint8Array', assert => {
  assert.plan(4)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', () => socket.send(new Uint8Array([1, 2, 3])))
  socket.on('data', function (data) {
    assert.true(data instanceof ArrayBuffer)

    const expectedMessage = new Uint8Array([1, 2, 3])
    const actualMessage = new Uint8Array(data)
    assert.deepEqual(actualMessage, expectedMessage)

    assertServerMessages(assert, [expectedMessage])
    socket.destroy()
  })
})

common.beforeEach()

test('invoking send after destroy throws an error', assert => {
  assert.plan(2)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  socket.on('connect', function () {
    socket.destroy()
    const error = common.tryCatch(() => socket.send('Hello, World!'))
    assert.true(error instanceof Error)
    assert.is(error.message, 'cannot call send after the socket has been destroyed')
  })
})

async function assertServerMessages (assert, expectedMessages) {
  const serverReceivedMessages = await webSocketServerClient.messagesReceived()
  assert.is(serverReceivedMessages.length, 1)
  assert.deepEqual(serverReceivedMessages, expectedMessages)
}
