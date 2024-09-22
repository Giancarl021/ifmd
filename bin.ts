#!/usr/bin/env node
import runner from './index';

const DEBUG_MODE = String(process.env.IFMD_DEBUG).toLowerCase() === 'true';

const promise = runner(DEBUG_MODE);

if (DEBUG_MODE) {
    promise.then(console.log).catch(console.error);
}
