#!/usr/bin/env node
import IFMD from './index';
import constants from './src/util/constants';

const runnerPromise = IFMD();

if (constants.cli.debugMode) {
    runnerPromise.then(console.log).catch(console.error);
}
