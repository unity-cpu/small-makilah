import { WebSocketServer } from 'ws';

export default function handler(req, res) {
  if (req.headers.upgrade !== 'websocket') {
    res.status(400).send('Expected WebSocket upgrade');
    return;
  }

  const wss = new WebSocketServer({ noServer: true });

  req.socket.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
      const text = data.toString();
      console.log('Received:', text);
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(text);
        }
      });
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
}