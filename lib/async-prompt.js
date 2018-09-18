const prompt = require('prompt');

function asyncPrompt(params) {
  return new Promise((resolve, reject) => {
    prompt.get(params, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } 
      resolve(result);
    });
  });
}

module.exports = {
  asyncPrompt,
};