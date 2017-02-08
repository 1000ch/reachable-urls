const URL = require('url-parse');
const urlRegex = require('url-regex');
const isString = require('is-string');
const isReachable = require('is-reachable');

module.exports = string => {
  if (!isString(string)) {
    return Promise.reject({});
  }

  const matches = string.match(urlRegex()) || [];
  const urls = matches.map(url => {
    const u = new URL(url);
    const suffix = /[）)<>].*$/;

    u.set('pathname', u.pathname.replace(suffix, ''));
    u.set('query', u.query.replace(suffix, ''));
    u.set('hash', u.hash.replace(suffix, ''));

    if (!u.protocol) {
      u.set('protocol', 'http:');
    }

    return u.toString();
  });
  const reachables = urls.map(url => isReachable(url));

  return Promise.all(reachables).then(results => {
    const object = {};
    urls.forEach((url, index) => {
      object[url] = results[index];
    });
    return object;
  });
};
