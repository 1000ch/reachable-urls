import test from 'ava';
import reachableUrls from '.';

test('Check all URLs are reachable', async t => {
  const string = 'https://google.com https://github.com';
  t.deepEqual(await reachableUrls(string), {
    'https://google.com': true,
    'https://github.com': true
  });
});

test('Check some URLs are reachable', async t => {
  const string = 'https://foobarbaz.com https://github.com';
  t.deepEqual(await reachableUrls(string), {
    'https://github.com': true,
    'https://foobarbaz.com': false
  });
});
