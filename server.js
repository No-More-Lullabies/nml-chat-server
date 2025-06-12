const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const server = new WebSocket.Server({ port: PORT });

let chatHistory = [];

// Clear out old messages older than 15 minutes
function cleanOldMessages() {
  const now = Date.now();
  chatHistory = chatHistory.filter(msg => now - msg.timestamp < 15 * 60 * 1000);
}

server.on('connection', socket => {
  cleanOldMessages();

  // Send chat history to the newly connected client
  chatHistory.forEach(entry => {
    socket.send(entry.data);
  });

  socket.on('message', async (message) => {
    let text;

    // Parse incoming message formats
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

    // Store message with timestamp
    chatHistory.push({
      timestamp: Date.now(),
      data: text
    });

    cleanOldMessages();

    // Broadcast message to all clients
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    });
  });
});

console.log(`WebSocket server running on port ${PORT}`);
