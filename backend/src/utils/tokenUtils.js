import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key';

export const tokenUtils = {
  generateToken: (userId, email) => {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
  },

  generateRefreshToken: (userId, email) => {
    return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  },

  verifyToken: (token) => {
    return jwt.verify(token, JWT_SECRET);
  },

  verifyRefreshToken: (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  },
};
