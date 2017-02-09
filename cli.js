#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const fsP = require('pify')(fs);
const minimist = require('minimist');
const globby = require('globby');
const chalk = require('chalk');
const symbols = require('log-symbols');
const reachableUrls = require('.');

const output = (object, compact = false) => {
  let output = '\n';

  for (const file of Object.keys(object)) {
    output += `  ${chalk.underline(file)}\n\n`;

    const result = object[file];
    const urls = Object.keys(result);
    const filteredUrls = compact ? urls.filter(url => !result[url]) : urls;

    for (const url of filteredUrls) {
      const reachable = result[url];
      const symbol = reachable ? symbols.success : symbols.error;
      output += `    ${symbol} ${url}\n`;
    }

    if (filteredUrls.length !== 0) {
      output += '\n';
    }
  }

  console.log(output);
};

const argv = minimist(process.argv.slice(2), {
  alias: {
    c: 'compact',
    h: 'help',
    v: 'version'
  },
  boolean: [
    'compact',
    'help',
    'version'
  ]
});

if (argv.version) {
  console.log(require('./package').version);
} else if (argv.h || argv.help) {
  fs.createReadStream(`${__dirname}/usage.txt`)
    .pipe(process.stdout)
    .on('close', () => process.exit(1));
} else {
  const files = globby.sync(argv._).map(file => path.resolve(process.cwd(), file));
  const texts = Promise.all(files.map(file => fsP.readFile(file).then(b => b.toString())));
  const reachables = texts.then(texts => Promise.all(texts.map(text => reachableUrls(text))));

  reachables.then(results => {
    const object = {};

    for (const file of files) {
      object[file] = results[files.indexOf(file)];
    }

    output(object, argv.v || argv.compact);
  });
}
