import cors from 'cors';

// Configure CORS for Firebase Functions
const corsOptions = {
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://quizbooth.games',
    'https://www.quizbooth.games',
    'https://trivia-games-7a81b.web.app',
    'https://trivia-games-7a81b.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  optionsSuccessStatus: 200
};

export const corsMiddleware = cors(corsOptions);

// Helper function to handle CORS in callable functions
export function withCors(handler: Function) {
  return (req: any, res: any) => {
    return new Promise((resolve, reject) => {
      corsMiddleware(req, res, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(handler(req, res));
        }
      });
    });
  };
}

// CORS handler for preflight requests
export const handleCors = (req: any, res: any) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
  } else {
    res.status(200).json({ message: 'CORS configured' });
  }
};
