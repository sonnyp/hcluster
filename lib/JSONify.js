'use strict'

var ndjson = require('ndjson')

module.exports = function JSONify (socket) {
  var address = socket.address()
  socket.id = address.address + ':' + address.port
  socket.setEncoding('utf8')
  socket.pipe(ndjson.parse({strict: true})).on('data', function (data) {
    socket.emit('message', data)
  })

  socket.sendMessage = function (m, cb) {
    console.log('socket', socket.id, 'OUT:', m)
    return socket.write(JSON.stringify(m) + '\n', cb)
  }
}
