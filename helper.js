const Request = require('request');

/**
 * @returns Array contains response and body
 */
function request(opt) {
  return new Promise((res, rej) => {
    Request(opt, (err, response, body) => {
      if(err)
        rej(err);
      else {
        res([response, body]);
      }
    });
  });
}

module.exports = {
  request,
};
