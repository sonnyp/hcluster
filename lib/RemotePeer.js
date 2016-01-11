'use strict'

var net = require('net')
var Peer = require('./Peer')
var inherits = require('util').inherits
var os = require('os')
var each = require('async-each')
var debug = require('debug')('RemotePeer')
var JSONify = require('./JSONify')

function noop () {}

function RemotePeer (conn) {
  Peer.call(this)
  this.socket = conn
  var address = conn.address()
  this.id = address.address + ':' + address.port

  this.handlers = {}
  this.methods = {}

  var that = this
  this.methods.ping = function () {
    return {}
  }

  this.methods.getNodes = function () {
    var nodes = []
    for (var key in that.nodes) {
      var address = that.nodes[key].address()
      nodes.push({port: address.port, host: address.address})
    }
    return {result: nodes}
  }

  this.methods.onNode = function (node) {
    that._onNode(node)
  }
}
inherits(RemotePeer, Peer)

RemotePeer.prototype.address = function () {
  return this.socket.address()
}

RemotePeer.prototype.notify = function (method, payload, cb) {
  if (typeof payload === 'function') {
    cb = payload
    payload = undefined
  }

  var m = {method: method}
  if (payload !== undefined) m.payload = payload
  return this.socket.sendMessage(m, cb)
}

RemotePeer.prototype.request = function (method, payload, cb) {
  if (typeof payload === 'function') {
    cb = payload
    payload = undefined
  }

  var id = Math.random().toString()
  var m = {id: id, method: method}
  if (payload !== undefined) m.payload = payload
  this.handlers[m.id] = cb
  return this.socket.sendMessage(m, function (err) {
    if (err) return cb(err)
  })
}

RemotePeer.prototype.send = function (m) {
  this.socket.sendMessage(m)
}

module.exports = RemotePeer
