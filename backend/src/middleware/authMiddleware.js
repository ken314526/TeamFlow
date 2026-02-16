import { tokenUtils } from '../utils/tokenUtils.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    const payload = tokenUtils.verifyToken(token);

    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
