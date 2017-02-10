const URL = require('url-parse');
const urlRegex = require('url-regex');
const isString = require('is-string');
const isReachable = require('is-reachable');

module.exports = string => {
  if (!isString(string)) {
    return Promise.resolve({});
  }

  const matches = string.match(urlRegex()) || [];
  const urls = matches.map(url => {
    const u = new URL(url);
    const suffix = /[^a-zA-Z0-9/+?#=].*$/;

    u.set('pathname', u.pathname.replace(suffix, ''));
    u.set('query', u.query.replace(suffix, ''));
    u.set('hash', u.hash.replace(suffix, ''));

    if (!u.protocol) {
      u.set('protocol', 'http:');
    }

    return u.toString();
  });

  if (urls.length === 0) {
    return Promise.resolve({});
  }

  const object = {};
  return urls.reduce((previous, current, index) => {
    return previous.then(result => {
      object[urls[index]] = result;

      if (urls.length - 1 === index) {
        return Promise.resolve(object);
      }

      return isReachable(urls[index + 1]);
    });
  }, isReachable(urls[0]));
};
