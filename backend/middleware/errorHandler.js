const errorHandler = (err, req, res, next) => {
  console.error(err);


  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry: this action was already performed.' });
  }


  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error.' });
};

module.exports = errorHandler;
