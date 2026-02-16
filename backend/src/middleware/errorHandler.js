export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key error' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.message === 'Invalid or expired token') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  return res.status(500).json({ message: 'Internal server error' });
};
