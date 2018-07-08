'use strict'

const test = require('tape')

const common = require('../tools/common')
const Socket = require('../../')
const webSocketServerClient = require('../tools/websocket-server-client')

common.beforeEach()

test('socket tries to reconnect when the server closes the connection', assert => {
  assert.plan(1)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  let connectCount = 0
  let disconnectCount = 0
  socket.on('connect', async function () {
    connectCount++
    await webSocketServerClient.disconnectAll()

    if (connectCount === 10) {
      assert.is(disconnectCount, 10)
      socket.destroy()
    }
  })
  socket.on('disconnect', () => disconnectCount++)
  socket.on('warning', () => assert.fail('warning event should not be emitted'))
})

common.beforeEach()

test('socket tries to reconnect when the server is shutdown', assert => {
  assert.plan(2)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL)

  let hasConnected = false
  let disconnectCount = 0
  let reconnectAttempts = 0
  socket.on('connect', function () {
    if (hasConnected) {
      assert.pass('socket reconnected after shutdown')
      assert.is(disconnectCount, 1)
      socket.destroy()
    } else {
      hasConnected = true
      webSocketServerClient.stop()
    }
  })

  socket.on('disconnect', () => disconnectCount++)
  socket.on('warning', () => {
    reconnectAttempts++

    if (reconnectAttempts === 5) {
      webSocketServerClient.start()
    }
  })
})

common.beforeEach()

test('socket continually tries to connect when the server is offline', async assert => {
  assert.plan(2)
  await webSocketServerClient.stop()

  const socket = new Socket(common.WEBSOCKET_SERVER_URL)
  let reconnectAttempts = 0

  socket.on('connect', function () {
    assert.pass('socket connected after the server was stopped then restarted')
    assert.is(reconnectAttempts, 5)
    socket.destroy()
  })

  socket.on('warning', () => {
    reconnectAttempts++

    if (reconnectAttempts === 5) {
      webSocketServerClient.start()
    }
  })
  socket.on('disconnect', () => assert.fail('disconnect event should not be emitted'))
})

common.beforeEach()

test('socket does not try to reconnect when autoReconnect is false', async assert => {
  assert.plan(4)
  await assertServerConnectAttempts(assert, 0)
  const socket = new Socket(common.WEBSOCKET_SERVER_URL, { autoReconnect: false })

  let hasConnected = false
  let disconnectCount = 0

  socket.on('connect', async function () {
    assert.false(hasConnected, 'connect event is emitted once')
    hasConnected = true

    await webSocketServerClient.disconnectAll()
    await common.wait(2000)

    await assertServerConnectAttempts(assert, 1)
    assert.is(disconnectCount, 1, 'disconnect event is emitted once')
  })

  socket.on('disconnect', () => disconnectCount++)
  socket.on('warning', () => assert.fail('warning event should not be emitted'))
})

common.beforeEach()

test('socket does not try to reconnect when maxReconnectAttempts has been exceeded', assert => {
  assert.plan(3)
  const maxReconnectAttempts = 2
  const socket = new Socket(common.WEBSOCKET_SERVER_URL, {
    maxReconnectAttempts: maxReconnectAttempts
  })

  socket.on('connect', () => webSocketServerClient.stop())

  let warningCount = 0
  socket.on('warning', function () {
    warningCount++

    if (warningCount === maxReconnectAttempts) {
      setTimeout(function () {
        assert.is(warningCount, maxReconnectAttempts)
        assert.true(socket.isDestroyed, 'socket is destroyed when maxReconnectAttempts has been exceeded')
      }, 5000)
    }
  })

  let hasEmittedDisconnect = false
  socket.on('disconnect', () => {
    assert.false(hasEmittedDisconnect, 'disconnect event is emitted once')
    hasEmittedDisconnect = true
  })
})

function assertServerConnectAttempts (assert, expectedCount) {
  return new Promise(async resolve => {
    const serverConnectAttempts = await webSocketServerClient.connectAttempts()
    assert.is(serverConnectAttempts, expectedCount, 'server received expected number of connect attempts')
    resolve()
  })
}
