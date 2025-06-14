const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const server = new WebSocket.Server({ port: PORT });

let chatHistory = [];

// ⏱️ Keep only messages from the past 2 hours
function cleanOldMessages() {
  const now = Date.now();
  chatHistory = chatHistory.filter(msg => now - msg.timestamp < 2 * 60 * 60 * 1000); // 2 hours
}

// 📣 Broadcast current user count to all clients
function broadcastUserCount() {
  const count = [...server.clients].filter(client => client.readyState === WebSocket.OPEN).length;
  const data = JSON.stringify({ type: 'userCount', count });

  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// 🔌 Handle new WebSocket connections
server.on('connection', socket => {
  cleanOldMessages();

  // Send existing chat history to new user
  chatHistory.forEach(entry => {
    socket.send(entry.data);
  });

  // Notify everyone of new user count
  broadcastUserCount();

  socket.on('close', () => {
    broadcastUserCount(); // Update count when someone disconnects
  });

  socket.on('message', async (message) => {
    let text;

    // Normalize message format
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

    // Store with timestamp
    chatHistory.push({
      timestamp: Date.now(),
      data: text
    });

    cleanOldMessages();

    // Broadcast message to all connected clients
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    });
  });
});

console.log(`✅ WebSocket server running on port ${PORT}`);
