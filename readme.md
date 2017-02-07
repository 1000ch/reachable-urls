# reachable-urls

Check URLs are reachable in text.

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
  --help          Show help
  --version       Show version
```

### JavaScript

```javascript
const reachableUrls = require('reachable-urls');
console.log(reachableUrls('https://foobarbaz.com https://github.com'));

// {
//   'https://github.com': true,
//   'https://foobarbaz.com': false
// }
```

## License

[MIT](https://1000ch.mit-license.org) © [Shogo Sensui](https://github.com/1000ch)
