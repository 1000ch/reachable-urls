import {Buffer} from 'node:buffer';
import urlRegex from 'url-regex';
import isString from 'is-string';
import isReachable from 'is-reachable';

const stringify = object => {
  if (isString(object)) {
    return object;
  }

  if (Buffer.isBuffer(object)) {
    return object.toString();
  }

  return '';
};

export default function reachableUrls(url) {
  const matches = stringify(url).match(urlRegex()) || [];
  const urls = matches.map(url => {
    const u = new URL(url);
    u.protocol ||= 'https:';

    return u;
  }).filter(url => /https?/.test(url.protocol)).map(url => {
    const suffix = /[^\w/+\-?#=:.].*$/;

    url.pathname = url.pathname?.replace(suffix, '');
    url.query = url.query?.replace(suffix, '');
    url.hash = url.hash?.replace(suffix, '');

    return url.toString();
  });

  if (urls.length === 0) {
    return Promise.resolve({});
  }

  const object = {};

  /* eslint-disable-next-line unicorn/no-array-reduce */
  return urls.reduce(async (previous, current, index) => {
    const result = await previous;
    object[urls[index]] = result;

    if (urls.length - 1 === index) {
      return object;
    }

    return isReachable(urls[index + 1]);
  }, isReachable(urls[0]));
}
