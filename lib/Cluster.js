'use strict'

var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var Peer = require('./Peer')
var JSONify = require('./JSONify')

function Cluster (options) {
  EventEmitter.call(this)
  this.connections = {}
  this.nodes = {}

  var server = this.server = net.createServer()

  server.on('listening', function () {
    that.emit('listening')
  })
  server.on('close', function () {
    that.emit('close')
  })
  server.on('error', function (error) {
    that.emit('error', error)
  })
  server.on('connection', function (conn) {
    JSONify(conn)
    var address = conn.address()
    var id = address.address + ':' + address.port
    var node = {host: address.address, port: address.port, id: id}
    that.nodes[id] = conn

    conn.on('message', function (m) {
      console.log('server', conn.id, 'IN:', m)
      if (typeof m.method === 'string') {
        var response = that.methods[m.method](m.payload)
        if (typeof m.id !== 'string') return
        response.id = m.id
        conn.sendMessage(response)
      }
    })

    conn.once('close', function () {
      delete that.nodes[id]
    })

    that.emit('node', node)
    that._onNode(node)
    // that.broadcast({method: 'onNode', payload: node})

    // conn.on('error', function (error) {
    //   console.error
    // })
    // conn.sendMessage({bar: 'foo'})
  })
}
inherits(Cluster, EventEmitter)

cluster.prototype.listen = function () {
  this.server.listen.apply(this.server, arguments)
}

// cluster.prototype.listen = function (handle, cb) {
//   if (typeof handle === 'function') {
//     cb = handle
//     handle = 0
//   }

//   this.server.listen(handle, cb)
// }

cluster.prototype.close = function () {
  this.server.close.apply(this.server, arguments)
}

cluster.prototype.broadcast = function (m) {
  for (var i in this.connections) {
    this.connections[i].sendMessage(m)
  }
}

module.exports = cluster
