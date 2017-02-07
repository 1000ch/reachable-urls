#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fsP = require('pify')(fs);
const minimist = require('minimist');
const chalk = require('chalk');
const symbols = require('log-symbols');
const reachableUrls = require('.');

const argv = minimist(process.argv.slice(2), {
  v: 'version',
  h: 'help'
});

if (argv.v || argv.version) {
  console.log(require('./package').version);
} else if (argv.h || argv.help) {
  fs.createReadStream(`${__dirname}/usage.txt`)
    .pipe(process.stdout)
    .on('close', () => process.exit(1));
} else {
  const files = argv._.map(file => path.resolve(process.cwd(), file));
  const texts = Promise.all(files.map(file => fsP.readFile(file).then(b => b.toString())));
  const reachables = texts.then(texts => Promise.all(texts.map(text => reachableUrls(text))));

  reachables.then(results => {
    let output = '\n';

    results.forEach((result, index) => {
      output += `  ${chalk.underline(files[index])}\n\n`;

      Object.keys(result).forEach(url => {
        const reachable = result[url];
        const symbol = reachable ? symbols.success : symbols.error;
        output += `    ${symbol} ${url}\n`;
      });

      output += '\n';
    });

    console.log(output);
  });
}
