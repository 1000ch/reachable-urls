#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const fsP = require('pify')(fs);
const minimist = require('minimist');
const ora = require('ora');
const globby = require('globby');
const getStdin = require('get-stdin');
const chalk = require('chalk');
const symbols = require('log-symbols');
const reachableUrls = require('.');

const getSymbol = isReachable => isReachable ? symbols.success : symbols.error;

const formatResult = (object, compact = false) => {
  let output = '\n';

  for (const file of Object.keys(object)) {
    output += `  ${chalk.underline(file)}\n\n`;

    const result = object[file];
    const keys = Object.keys(result);
    const urls = compact ? keys.filter(url => !result[url]) : keys;

    for (const url of urls) {
      output += `    ${getSymbol(result[url])} ${url}\n`;
    }

    if (urls.length !== 0) {
      output += '\n';
    }
  }

  return output;
};

const getExitCode = (object = {}) => {
  for (const file of Object.keys(object)) {
    const result = object[file];

    for (const url of Object.keys(result)) {
      if (!result[url]) {
        return 1;
      }
    }
  }

  return 0;
};

const getResult = args => {
  let count = 0;
  let files = [];
  const spinner = ora('Checking files').start();

  return globby(args, {
    nodir: true
  }).then(foundFiles => {
    return foundFiles.map(file => path.resolve(process.cwd(), file));
  }).then(foundFiles => {
    files = foundFiles;

    return Promise.all(foundFiles.map(file => {
      return fsP.readFile(file);
    }));
  }).then(texts => {
    return Promise.all(texts.map(text => {
      return reachableUrls(text).then(result => {
        spinner.text = `Checking files [${++count} of ${files.length}]`;

        return result;
      });
    }));
  }).then(results => {
    spinner.stop();

    const result = {};
    files.forEach((file, index) => {
      result[file] = results[index];
    });
    return result;
  });
};

process.once('uncaughtException', err => {
  console.error(err);
  process.exit(1);
});

const argv = minimist(process.argv.slice(2), {
  alias: {
    c: 'compact',
    h: 'help',
    s: 'silent',
    v: 'version'
  },
  boolean: [
    'compact',
    'help',
    'silent',
    'version'
  ]
});

if (argv.v || argv.version) {
  console.log(require('./package').version);
} else if (argv.h || argv.help) {
  fsP.readFile(`${__dirname}/usage.txt`).then(help => console.log(help.toString()));
} else if (argv.stdin) {
  getStdin().then(string => reachableUrls(string)).then(object => {
    const result = {'': object};
    const output = formatResult(result, argv.c || argv.compact);
    const exitCode = (argv.s || argv.silent) ? 0 : getExitCode(result);

    console.log(output);
    process.exit(exitCode);
  });
} else {
  getResult(argv._).then(result => {
    const output = formatResult(result, argv.c || argv.compact);
    const exitCode = (argv.s || argv.silent) ? 0 : getExitCode(result);

    console.log(output);
    process.exit(exitCode);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
