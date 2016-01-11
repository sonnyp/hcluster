'use strict'

var peer = require('./index')()

peer.on('listening', function () {
  console.log('listening', peer.address())
})
peer.on('online', function () {
  console.log('online')
})
peer.on('peer', function (peer) {
  console.log('peer', peer.id)
})
peer.on('error', function (err) {
  console.log(err)
})
peer.listen(2424)
