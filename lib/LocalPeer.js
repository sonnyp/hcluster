'use strict'

var net = require('net')
var Peer = require('./Peer')
var inherits = require('util').inherits
var os = require('os')
var each = require('async-each')
var debug = require('debug')('LocalPeer')
var RemotePeer = require('./RemotePeer')
var JSONify = require('./JSONify')

function noop () {}

function LocalPeer () {
  Peer.call(this)
  this.handlers = {}
  this.methods = {}
  this.nodes = {}
  this.peers = {}

  var that = this
  this.methods.ping = function () {
    return {}
  }

  this.methods.getPeers = function () {
    var peers = []
    for (var key in that.peers) {
      var address = that.peers[key].address()
      peers.push({port: address.port, host: address.address})
    }
    return {result: nodes}
  }

  this.methods.onNode = function (node) {
    that._onNode(node)
  }

  this.connections = {}
  this.hostame = os.hostname()

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
    var peer = new RemotePeer(conn)
    // var id = address.address + ':' + address.port
    // var node = {host: address.address, port: address.port, id: id}
    that.peers[peer.id] = peer

    conn.on('message', function (m) {
      console.log('server', conn.id, 'IN:', m)
      if (typeof m.method === 'string') {
        var response = that.methods[m.method](m.payload)
        if (typeof m.id !== 'string') return
        response.id = m.id
        conn.sendMessage(response)
      }
    })

    for (var id in that.peers) {
      console.log(that.peers[id].address())
      var address = that.peers[id].address()
      peer.send({CMD: 'peer', port: address.port, host: address.address})
    }

    conn.once('close', function () {
      delete that.peers[peer.id]
    })

    that.emit('peer', peer)
    that._onPeer(peer)
    // that.broadcast({method: 'onNode', payload: node})

    // conn.on('error', function (error) {
    //   console.error
    // })
    // conn.sendMessage({bar: 'foo'})
  })
}
inherits(LocalPeer, Peer)

LocalPeer.prototype._onPeer = function (peer) {
  if (peer.id in this.peers) return
  var that = this
  this.connect(peer.port, peer.host, function (err) {
    if (err) return that.emit('error', err)
  })
}

LocalPeer.prototype.address = function () {
  return this.server.address()
}

// connect to a cluster node
LocalPeer.prototype.connect = function (port, host, cb) {
  var that = this
  var conn = net.createConnection(port, host, function (err) {
    if (err) return cb(err)
    JSONify(conn)

    conn.on('message', function (m) {
      console.log('client', conn.id, 'IN:', m)

      if (m.CMD === 'peer') {
        that._onPeer(m.port, m.host)
        return
      }

      if (typeof m.id === 'string' && m.method === undefined) {
        var handler = that.handlers[m.id]
        if (!handler) return
        handler(m.error, m.result)
        delete that.handlers[m.id]
      }
    })

    that.connections[conn.id] = conn
    cb(null, conn)
    that.emit('node', port, host)
  })
}

// join cluster
LocalPeer.prototype.join = function (port, host, cb) {
  cb = cb || noop
  var that = this
  this.connect(port, host, function (err, conn) {
    if (err) return cb(err)

    that.connection = conn

    that.request('getNodes', function (err, nodes) {
      if (err) return cb(err)

      each(nodes, function (node, fn) {
        that.connect(node.port, node.host, fn)
      }, function (err) {
        if (err) return cb(err)
        that.emit('online')
      })
    })
    // conn.sendMessage({foo: 'bar'})
    // that.emit('node', port, host)
  })
}

LocalPeer.prototype.leave = function (cb) {
  cb = cb || noop
  for (var id in this.connections) {
    this.connections[id].end()
  }
  cb()
}

LocalPeer.prototype.listen = function (handle, cb) {
  if (typeof handle === 'function') {
    cb = handle
    handle = 0
  }

  this.server.listen(handle, cb)
}

LocalPeer.prototype.close = function (cb) {
  this.server.close(cb)
}

LocalPeer.prototype.broadcast = function (m) {
  for (var i in this.peers) {
    this.peers[i].send(m)
  }
}

module.exports = LocalPeer
