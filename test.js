import test from 'ava';
import reachableUrls from '.';

test('Check all URLs are reachable', async t => {
  const strings = [
    'https://google.com',
    'https://github.com'
  ];

  t.deepEqual(await reachableUrls(strings.join(' ')), {
    'https://google.com': true,
    'https://github.com': true
  });
});

test('Check some URLs are reachable', async t => {
  const strings = [
    'https://foobarbaz.com',
    'https://github.com'
  ];

  t.deepEqual(await reachableUrls(strings.join(' ')), {
    'https://github.com': true,
    'https://foobarbaz.com': false
  });
});

test('Filter URLs not over http or https', async t => {
  const strings = [
    'ws://echo.websocket.org',
    'file:///path/to/workspace'
  ];

  t.deepEqual(await reachableUrls(strings.join(' ')), {});
});

test('Check text which does not contain URLs', async t => {
  const string = 'Lorem ipsum';

  t.deepEqual(await reachableUrls(string), {});
});

test('Remove needless URL suffixes', async t => {
  const strings = [
    'https://google.com/+shogosensui[',
    'https://github.com/1000ch(',
    'https://twitter.com/jxck_<',
    'https://facebook.com#hash"',
    'https://www.messenger.com/)',
    'https://www.mozilla.jp?key=valueあ',
    'https://travis-ci.org/。'
  ];

  t.deepEqual(await reachableUrls(strings.join(' ')), {
    'https://google.com/+shogosensui': true,
    'https://github.com/1000ch': true,
    'https://twitter.com/jxck_': true,
    'https://facebook.com#hash': true,
    'https://www.messenger.com/': true,
    'https://www.mozilla.jp?key=value': true,
    'https://travis-ci.org/': true
  });
});
