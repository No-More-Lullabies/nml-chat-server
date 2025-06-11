const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const server = new WebSocket.Server({ port: PORT });

server.on('connection', socket => {
  socket.on('message', async (message) => {
    let text;

    if (typeof message === 'string') {
      text = message;
    } else if (message instanceof Buffer) {
      text = message.toString('utf-8');
    } else if (message.arrayBuffer) {
      const buffer = await message.arrayBuffer();
      text = Buffer.from(buffer).toString('utf-8');
    } else {
      text = '[Unrecognized message format]';
    }

    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    });
  });
});

console.log(`WebSocket server running on port ${PORT}`);
