module.exports = function UUID(){
  const crypto = require('crypto');
  return crypto.randomBytes(4).toString('hex')+"-"+crypto.randomBytes(6).toString('hex');
};