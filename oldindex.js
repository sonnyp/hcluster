'use strict'

var Node = require('./lib/Node')

// var A = new Node()
// A.name = 'A'
// var B = new Node()
// B.name = 'B'

var nodes = []

for (var i = 0; i < 2; i++) {
  var node = new Node()
  node.name = i
  nodes.push(node)
}

nodes.forEach(function (node) {
  node.on('listening', function () {
    console.log(node.name, 'listening', node.address())
  })
  node.on('node', function (port, host) {
    console.log(node.name, 'node', port, host)
  })
  node.listen()
})

setTimeout(function () {
  var address = nodes[0].address()
  nodes.forEach(function (node) {
    if (node === nodes[0]) return
    node.join(address.port, address.address, function (err) {
      console.log(err || 'cluster joined ok')
    })
    // nodes.forEach(function (anode) {
    //   if (anode === node) return
    //   var address = anode.address()

    //   node.join(address.port, address.address)
    // })
  })
}, 500)

setTimeout(function () {
  node.broadcast({'hello': 'world'})
}, 1000)

// var net = require('net')

// var PORT_A = 1234
// var serverA = net.createServer()
// serverA.listen(PORT_A)
// serverA.name = 'A'

// var PORT_B = 1235
// var serverB = net.createServer()
// serverB.listen(PORT_B)
// serverB.name = 'B'

// var servers = [serverA, serverB]
// servers.forEach(function (server) {
//   server.on('listening', function () {
//     console.log('server', server.name, 'listening')
//   })
// })

// var clientA = net.createConnection(PORT_A)
// clientA.name = 'A'
// var clientB = net.createConnection(PORT_B)
// clientB.name = 'B'

// var clients = [clientA, clientB]
// clients.forEach(function (client) {
//   client.on('connect', function () {
//     console.log('client', client.name, 'connected')
//   })
// })
