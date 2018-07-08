# One WebSocket [![Build Status](https://travis-ci.org/shanebloomer/one-websocket.svg?branch=master)](https://travis-ci.org/shanebloomer/one-websocket)

One WebSocket is a JavaScript module for using WebSockets in the browser or Node.js.

The socket will automatically attempt to reconnect if it is disconnected or the server is offline.

*Please note that the API is currently unstable and is highly likely to change.*

## Install

```sh
$ npm install one-websocket
```

If you are not using a module bundler, then use the standalone file `one-websocket.min.js`. This exports a `OneWebSocket` constructor on window. Wherever you see OneWebSocket in the examples below, substitute that with window.OneWebSocket.

## Example

```javascript
const OneWebSocket = require('one-websocket')

const socket = new OneWebSocket('ws://localhost:3000')

socket.on('connect', function () {
  socket.send('Hello!')
})

socket.on('data', function (data) {
  console.log(`Received message: ${data}`)
})
```

## Events

### Event: 'connect'

```js
socket.on('connect', function () {
  console.log('Connection established to the server.')
})
```

Emitted when a socket connection has successfully been established.

### Event: 'data'

```js
socket.on('data', function (data) {
  console.log(`Received message: ${data}`)
})
```

Emitted when a message is received from the server.

### Event: 'disconnect'

```js
socket.on('disconnect', function () {
  console.log('No longer connected to the server.')
  console.log(socket.isConnected) // false
})
```

Emitted when the socket has been disconnected to the server.

### Event: 'warning'

```js
socket.on('warning', function (err) {
  console.log(err)
})
```

Emitted when an error has occured.

The most common case when a warning event is emitted is when the server is unreachable.

## API

### Constructor parameters

`const socket = new OneWebSocket(url, options)`

Once the socket instance has been created it will automatically attempt to make a connection to the server.

### `url`

A WebSocket connection will be established to the server at the specified url.

### `options`

- `autoReconnect` - whether to reconnect automatically or not (default is `true`).
- `maxReconnectAttempts` - number of reconnect attempts before giving up (default is `Infinity`).

When the JavaScript environment is Node.js then `options` is passed to the constructor of the [`ws`](https://github.com/websockets/ws) module.

### `socket.send(data)`

Send the `data` to the server.

Invoking `send` while the socket is not connected will throw an error. `send` will also throw an error if called after the socket has been destroyed.

### `socket.destroy()`

This will forcibly close the connection. As a result no further events will be emitted. If the socket is already destroyed, this method does nothing.

### `socket.isConnected`

A Boolean value indicating whether the socket is currently connected to the server.

### `socket.isDestroyed`

A Boolean value that indicates if the socket is destroyed or not. Once destroyed no further data can be transferred using it. No further events will be emitted.

### `socket.readyState`

An integer representing the current state of the connection. This is one of the [`ready state constants`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Ready_state_constants):

0 - CONNECTING

1 - OPEN

2 - CLOSING

3 - CLOSED

### `socket.url`

The `url` is the string as resolved by the constructor.

### `socket.binaryType`

A string indicating the type of binary data being transmitted by the connection.

### `socket.bufferedAmount`

The number of bytes of data that have been queued using calls to send() but not yet transmitted to the network. This value resets to zero once all queued data has been sent. When the socket is disconnected this value is reset to zero.

## Static Constants

There are static constants available for the ready states: `CONNECTING`, `OPEN`, `CLOSED`, `CLOSING`.

Another one is `IS_WEBSOCKET_SUPPORTED` which returns a boolean value indicating whether the JavaScript environment supports WebSockets.

```javascript
const Socket = require('one-websocket')

console.log(Socket.CONNECTING) // 0
console.log(Socket.OPEN) // 1
console.log(Socket.CLOSING) // 2
console.log(Socket.CLOSED) // 3

console.log(Socket.IS_WEBSOCKET_SUPPORTED) // true or false
```

## Reconnect Strategy

A binary [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) algorithm is used for spacing out reconnects.

The table below shows the maximum delay given the number of reconnect attempts. After six reconnect attempts the potential maximum delay before reattempting is twenty seconds.

The actual delay value used is a random integer between zero (inclusive) and the maximum delay (inclusive).

| Reconnect attempt number | Maximum possible delay (milliseconds) |
| ------------------------ | ------------------------------------- |
| 1                        | 1,000                                 |
| 2                        | 2,000                                 |
| 3                        | 4,000                                 |
| 4                        | 8,000                                 |
| 5                        | 16,000                                |
| 6                        | 20,000                                |
| 7                        | 20,000                                |
| 8                        | 20,000                                |

## Tests

Open three terminals.

Start the test server:

```sh
$ npm run start-test-server
```

Run the tests for the browser:

```sh
$ npm run test-browser-local
```

Run the tests for Node.js:

```sh
$ npm run test-node
```

## License

MIT. Copyright (c) [Shane Bloomer](https://github.com/shanebloomer).
