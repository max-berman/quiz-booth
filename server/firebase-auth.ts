import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any; // DecodedIdToken from firebase-admin
}

export async function verifyFirebaseToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header required' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
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
      // Try to verify the token without checking claims first
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(idToken, false);
      req.user = decodedToken;
      console.log('Auth middleware: Token verified successfully for user:', decodedToken.uid);
    } catch (error: any) {
      console.log('Auth middleware: Optional auth failed, continuing without user context.');
      console.log('Auth middleware: Error details:', {
        code: error?.code,
        message: error?.message,
        errorInfo: error?.errorInfo
      });
    }
  } else {
    console.log('Auth middleware: No valid authorization header found');
  }
  
  next();
}