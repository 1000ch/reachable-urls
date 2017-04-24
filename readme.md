# reachable-urls

Check URLs are reachable in text.

[![Build Status](https://travis-ci.org/1000ch/reachable-urls.svg?branch=master)](https://travis-ci.org/1000ch/reachable-urls)
[![NPM version](https://badge.fury.io/js/reachable-urls.svg)](http://badge.fury.io/js/reachable-urls)
[![Dependency Status](https://david-dm.org/1000ch/reachable-urls.svg)](https://david-dm.org/1000ch/reachable-urls)
[![devDependency Status](https://david-dm.org/1000ch/reachable-urls/dev-status.svg)](https://david-dm.org/1000ch/reachable-urls?type=dev)

![screenshot](screenshot.gif)

## Install

```bash
$ npm install --save reachable-urls
```

## Usage

### CLI

```bash
Usage
  $ reachable-urls [<file|glob> ...]

Options
  --compact       Show only not-reachable URLs
  --help          Show help
  --silent        Exit with success always
  --stdin         Check string from stdin
  --version       Show version
```

### JavaScript

```javascript
const assert = require('assert');
const reachableUrls = require('reachable-urls');

reachableUrls('https://foobarbaz.com https://github.com').then(result => {
  assert.deepEqual(result, {
    'https://github.com': true,
    'https://foobarbaz.com': false
  });
});
```

## License

[MIT](https://1000ch.mit-license.org) © [Shogo Sensui](https://github.com/1000ch)
