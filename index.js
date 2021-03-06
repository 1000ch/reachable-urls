const URL = require('url-parse');
const urlRegex = require('url-regex');
const isString = require('is-string');
const isReachable = require('is-reachable');

const stringify = arg => {
  if (isString(arg)) {
    return arg;
  }

  if (Buffer.isBuffer(arg)) {
    return arg.toString();
  }

  return '';
};

module.exports = arg => {
  const matches = stringify(arg).match(urlRegex()) || [];
  const urls = matches.map(url => {
    const u = new URL(url);

    if (!u.protocol) {
      u.set('protocol', 'http:');
    }

    return u;
  }).filter(url => /https?/.test(url.protocol)).map(url => {
    const suffix = /[^\w/+\-?#=:.].*$/;

    url.set('pathname', url.pathname.replace(suffix, ''));
    url.set('query', url.query.replace(suffix, ''));
    url.set('hash', url.hash.replace(suffix, ''));

    return url.toString();
  });

  if (urls.length === 0) {
    return Promise.resolve({});
  }

  const object = {};

  /* eslint-disable-next-line unicorn/no-reduce */
  return urls.reduce(async (previous, current, index) => {
    const result = await previous;
    object[urls[index]] = result;

    if (urls.length - 1 === index) {
      return Promise.resolve(object);
    }

    return isReachable(urls[index + 1]);
  }, isReachable(urls[0]));
};
