import type { Plugin } from 'vite';
import { mockApiHandler } from './api-mock';

export function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        if (req.url && (req.url.includes('/questions') || req.url.includes('/play-count'))) {
          try {
            const result = await mockApiHandler(req.url);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(result));
          } catch (error) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
          }
          return;
        }
        next();
      });
    }
  };
}
