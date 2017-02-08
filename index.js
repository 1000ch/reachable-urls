const urlRegex = require('url-regex');
const isString = require('is-string');
const isReachable = require('is-reachable');

module.exports = string => {
  if (!isString(string)) {
    return Promise.reject({});
  }

  const urls = string.match(urlRegex()) || [];
  const reachables = urls.map(url => isReachable(url));

  return Promise.all(reachables).then(results => {
    const object = {};
    urls.forEach((url, index) => {
      object[url] = results[index];
    });
    return object;
  });
};
