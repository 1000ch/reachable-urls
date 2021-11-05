#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import minimist from 'minimist';
import ora from 'ora';
import globby from 'globby';
import getStdin from 'get-stdin';
import chalk from 'chalk';
import symbols from 'log-symbols';
import reachableUrls from './index.js';

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

    if (urls.length > 0) {
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

const getResult = async args => {
  const spinner = ora('Checking files').start();
  const foundFiles = await globby(args, {nodir: true});
  const files = foundFiles.map(file => path.resolve(process.cwd(), file));
  const texts = await Promise.all(foundFiles.map(file => fs.readFile(file)));

  let count = 0;

  // eslint-disable-next-line arrow-body-style
  const results = await Promise.all(texts.map(text => {
    return reachableUrls(text).then(result => {
      spinner.text = `Checking files [${++count} of ${files.length}]`;

      return result;
    });
  }));

  spinner.stop();

  const result = {};
  for (const [index, file] of files.entries()) {
    result[file] = results[index];
  }

  return result;
};

process.once('uncaughtException', error => {
  console.error(error);
  process.exit(1);
});

const argv = minimist(process.argv.slice(2), {
  alias: {
    c: 'compact',
    h: 'help',
    s: 'silent',
    v: 'version',
  },
  boolean: [
    'compact',
    'help',
    'silent',
    'version',
  ],
});

(async () => {
  if (argv.v || argv.version) {
    const json = JSON.parse(await fs.readFile('package.json', 'utf-8'));

    console.log(json.version);
  } else if (argv.h || argv.help) {
    const help = await fs.readFile('usage.txt', 'utf-8');

    console.log(help);
  } else if (argv.stdin) {
    const string = await getStdin();
    const object = await reachableUrls(string);
    const result = {'': object};
    const output = formatResult(result, argv.c || argv.compact);
    const exitCode = (argv.s || argv.silent) ? 0 : getExitCode(result);

    console.log(output);
    process.exit(exitCode);
  } else {
    try {
      const result = await getResult(argv._);
      const output = formatResult(result, argv.c || argv.compact);
      const exitCode = (argv.s || argv.silent) ? 0 : getExitCode(result);

      console.log(output);
      process.exit(exitCode);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
})();
