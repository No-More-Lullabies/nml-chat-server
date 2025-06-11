const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const server = new WebSocket.Server({ port: PORT });

server.on('connection', socket => {
  socket.on('message', message => {
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

console.log(`WebSocket server running on port ${PORT}`);