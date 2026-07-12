const crypto = require('crypto');

const generateTicketCode = () => {
  const random = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `RTG-${random}`;
};

module.exports = generateTicketCode;
