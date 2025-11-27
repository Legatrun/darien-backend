module.exports = (req, res, next) => {
  if (req.path.startsWith('/socket.io/')) return next();
  const apiKey = req.header('X-API-Key');
  const validApiKey = process.env.API_KEY || 'secret-api-key-123';

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API Key'
    });
  }

  next();
};
