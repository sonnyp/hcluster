'use strict'

var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

function Peer () {
  EventEmitter.call(this)
  // this.handlers = {}
  // this.methods = {}
  // this.nodes = {}

  // var that = this
  // this.methods.ping = function () {
  //   return {}
  // }

  // this.methods.getNodes = function () {
  //   var nodes = []
  //   for (var key in that.nodes) {
  //     var address = that.nodes[key].address()
  //     nodes.push({port: address.port, host: address.address})
  //   }
  //   return {result: nodes}
  // }

  // this.methods.onNode = function (node) {
  //   that._onNode(node)
  // }

  // this.connections = {}
  // this.hostame = os.hostname()

  // var server = this.server = net.createServer()

  // server.on('listening', function () {
  //   that.emit('listening')
  // })
  // server.on('close', function () {
  //   that.emit('close')
  // })
  // server.on('error', function (error) {
  //   that.emit('error', error)
  // })
  // server.on('connection', function (conn) {
  //   JSONify(conn)
  //   var address = conn.address()
  //   var id = address.address + ':' + address.port
  //   var node = {host: address.address, port: address.port, id: id}
  //   that.nodes[id] = conn

  //   conn.on('message', function (m) {
  //     console.log('server', conn.id, 'IN:', m)
  //     if (typeof m.method === 'string') {
  //       var response = that.methods[m.method](m.payload)
  //       if (typeof m.id !== 'string') return
  //       response.id = m.id
  //       conn.sendMessage(response)
  //     }
  //   })

  //   conn.once('close', function () {
  //     delete that.nodes[id]
  //   })

  //   that.emit('peer', node)
  //   that._onNode(node)
  //   // that.broadcast({method: 'onNode', payload: node})

  //   // conn.on('error', function (error) {
  //   //   console.error
  //   // })
  //   // conn.sendMessage({bar: 'foo'})
  // })
}
inherits(Peer, EventEmitter)

// Peer.prototype._onNode = function (node) {
//   if (node.id in this.nodes) return
//   var that = this
//   this.connect(node.port, node.host, function (err) {
//     if (err) return that.emit('error', err)
//   })
// }

// Peer.prototype.address = function () {
//   return this.server.address()
// }

// // connect to a cluster node
// Peer.prototype.connect = function (port, host, cb) {
//   var that = this
//   var conn = net.createConnection(port, host, function (err) {
//     if (err) return cb(err)
//     JSONify(conn)

//     conn.on('message', function (m) {
//       console.log('client', conn.id, 'IN:', m)

//       if (typeof m.id === 'string' && m.method === undefined) {
//         var handler = that.handlers[m.id]
//         if (!handler) return
//         handler(m.error, m.result)
//         delete that.handlers[m.id]
//       }
//     })

//     that.connections[conn.id] = conn
//     cb(null, conn)
//     that.emit('node', port, host)
//   })
// }

// // join cluster
// Peer.prototype.join = function (port, host, cb) {
//   cb = cb || noop
//   var that = this
//   this.connect(port, host, function (err, conn) {
//     if (err) return cb(err)

//     that.connection = conn

//     that.request('getNodes', function (err, nodes) {
//       if (err) return cb(err)

//       each(nodes, function (node, fn) {
//         that.connect(node.port, node.host, fn)
//       }, function (err) {
//         if (err) return cb(err)
//         that.emit('online')
//       })
//     })
//     // conn.sendMessage({foo: 'bar'})
//     // that.emit('node', port, host)
//   })
// }

// Peer.prototype.leave = function (cb) {
//   cb = cb || noop
//   for (var id in this.connections) {
//     this.connections[id].end()
//   }
//   cb()
// }

// Peer.prototype.notify = function (method, payload, cb) {
//   if (typeof payload === 'function') {
//     cb = payload
//     payload = undefined
//   }

//   var m = {method: method}
//   if (payload !== undefined) m.payload = payload
//   return this.connection.sendMessage(m, cb)
// }

Peer.prototype.request = function (method, payload, cb) {
  if (typeof payload === 'function') {
    cb = payload
    payload = undefined
  }

  var id = Math.random().toString()
  var m = {id: id, method: method}
  if (payload !== undefined) m.payload = payload
  this.handlers[m.id] = cb
  return this.connection.sendMessage(m, function (err) {
    if (err) return cb(err)
  })
}

// Peer.prototype.listen = function (handle, cb) {
//   if (typeof handle === 'function') {
//     cb = handle
//     handle = 0
//   }

//   this.server.listen(handle, cb)
// }

// Peer.prototype.close = function (cb) {
//   this.server.close(cb)
// }

// Peer.prototype.broadcast = function (m) {
//   for (var i in this.connections) {
//     this.connections[i].sendMessage(m)
//   }
// }

module.exports = Peer
