#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const fsP = require('pify')(fs);
const minimist = require('minimist');
const globby = require('globby');
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
  const files = globby.sync(argv._).map(file => path.resolve(process.cwd(), file));
  const texts = Promise.all(files.map(file => fsP.readFile(file).then(b => b.toString())));
  const reachables = texts.then(texts => Promise.all(texts.map(text => reachableUrls(text))));

  reachables.then(results => {
    let output = '\n';

    results.forEach((result, index) => {
      output += `  ${chalk.underline(files[index])}\n\n`;

      const urls = Object.keys(result);
      urls.forEach(url => {
        const reachable = result[url];
        const symbol = reachable ? symbols.success : symbols.error;
        output += `    ${symbol} ${url}\n`;
      });

      if (urls.length !== 0) {
        output += '\n';
      }
    });

    console.log(output);
  });
}
