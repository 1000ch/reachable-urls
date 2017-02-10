#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const fsP = require('pify')(fs);
const minimist = require('minimist');
const ora = require('ora');
const globby = require('globby');
const chalk = require('chalk');
const symbols = require('log-symbols');
const reachableUrls = require('.');

const symbol = reachable => reachable ? symbols.success : symbols.error;

const format = (object, compact = false) => {
  let output = '\n';

  for (const file of Object.keys(object)) {
    output += `  ${chalk.underline(file)}\n\n`;

    const result = object[file];
    const keys = Object.keys(result);
    const urls = compact ? keys.filter(url => !result[url]) : keys;

    for (const url of urls) {
      output += `    ${symbol(result[url])} ${url}\n`;
    }

    if (urls.length !== 0) {
      output += '\n';
    }
  }

  return output;
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

if (argv.v || argv.version) {
  console.log(require('./package').version);
} else if (argv.h || argv.help) {
  fs.createReadStream(`${__dirname}/usage.txt`)
    .pipe(process.stdout)
    .on('close', () => process.exit(1));
} else {
  let count = 0;
  let files = [];
  const spinner = ora('Checking files').start();

  globby(argv._)
    .then(foundFiles => {
      return foundFiles.map(file => path.resolve(process.cwd(), file));
    })
    .then(foundFiles => {
      files = foundFiles;

      return Promise.all(foundFiles.map(file => {
        return fsP.readFile(file).then(b => b.toString());
      }));
    })
    .then(texts => {
      return Promise.all(texts.map(text => {
        return reachableUrls(text).then(result => {
          spinner.text = `Checking files [${++count} of ${files.length}]`;

          return result;
        });
      }));
    })
    .then(results => {
      const object = {};
      files.forEach((file, index) => {
        object[file] = results[index];
      });

      spinner.stop();
      console.log(format(object, argv.c || argv.compact));
      process.exit(0);
    });
}
