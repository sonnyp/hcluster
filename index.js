'use strict'

// var p2pcluster = require('./lib/p2pcluster')
var RemotePeer = require('./lib/RemotePeer')
var LocalPeer = require('./lib/LocalPeer')
var Peer = require('./lib/Peer')

module.exports = function(options) {
  return new LocalPeer(options)
}
module.exports.RemotePeer = RemotePeer
module.exports.LocalPeer = LocalPeer
module.exports.Peer = Peer
