'use strict'

const webSocketServerClient = require('../tools/websocket-server-client')

startBrowserTests()

async function startBrowserTests () {
  await webSocketServerClient.start()

  require('./basic.test.js')
  require('./events.test.js')
  require('./send.test.js')
  require('./reconnect.test.js')
}
