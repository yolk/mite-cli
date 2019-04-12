#!/usr/bin/env node
'use strict';

/**
 * https://www.npmjs.com/package/tabtab#3-parsing-env
 *
 * @param {string} env.prev - last given argument value, or previously
 *                            completed value
 * @param {string} env.words - the number of argument currently active
 * @param {string} env.line - the current complete input line in the cli
 * @returns {Promise<Array<string>>}
 */
module.exports = async ({ words, prev }) => {
  switch(words) {
    case 2: {
      return ['2', '22'];
    }
    case 3: {
      return ['33', '33'];
    }
    case 4: {
      return ['44', '44'];
    }
  }
}
