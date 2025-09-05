import * as admin from 'firebase-admin';
import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function verifyFirebaseToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header required' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
}

export async function optionalFirebaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log('Auth middleware: Authorization header present?', !!authHeader);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    console.log('Auth middleware: Token extracted, length:', idToken?.length);
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      console.log('Auth middleware: Token verified successfully for user:', decodedToken.uid);
    } catch (error) {
      console.log('Auth middleware: Optional auth failed, continuing without user context. Error:', error);
    }
  } else {
    console.log('Auth middleware: No valid authorization header found');
  }
  
  next();
}