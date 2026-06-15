import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import next from 'next';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = false;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Log all requests
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} Host=${req.headers.host}`);
    
    const parsedUrl = parseUrl(req.url, true);
    handle(req, res, parsedUrl).then(() => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - start}ms)`);
    }).catch((err) => {
      console.error(`Error handling ${req.url}:`, err);
    });
  });
  
  server.on('clientError', (err, socket) => {
    console.error('Client error:', err.message);
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  server.listen(port, '::', () => {
    console.log(`> Ready on http://[::]:${port}`);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });
  
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
  });
});
