'use strict';

const chalk = require('chalk');
const assert = require('assert');
const tableLib = require('table');
const table = tableLib.table;

/**
 * @type {FORMAT}
 * @readonly
 * @enum {string}
 */
const FORMAT = {
  JSON: 'json',
  TABLE: 'table',
  DEFAULT: 'table',
  TEXT: 'text',
};
const FORMATS = Object.values(FORMAT);

/**
 * @params {FORMAT}
 * @returns {Boolean}
 */
function supportsExtendedFormat(format) {
  if (process.env.NO_COLOR) {
    return false;
  }
  return [
    FORMAT.TABLE
  ].indexOf(format) !== -1;
}

/**
 * @typedef ColumnDefinition
 * @property {String} label label used for the table header
 * @property {String} attribute name of the attribute which should be shown
 * @property {function} format optional function for formatting the value
 * @property {Number} width fixed with column
 * @property {String} alignment either left, right or center
 * @property {Boolean} wrapWord flag for wrapping long words when column width reached
 */

/**
 * @param {Array<Object>} items
 * @param {Array<ColumnDefinition} columns
 * @param {FORMAT} format
 * @return {Array<Array<String>>}
 */
function compileTableData(items, columns, format = FORMAT.TABLE) {
  assert(Array.isArray(items), 'expected data to be an array');
  assert(Array.isArray(columns), 'expected columns to be an array');

  return items.map(item => {
    // format the value of the column according to the column definition
    // or formatting function
    let row = columns.map(columnDefinition => {
      const value = item[columnDefinition.attribute];
      if (typeof columnDefinition.format === 'function') {
        return columnDefinition.format(value, item, format);
      }
      return value;
    });
    // show archived items in grey
    if (item.archived) {
      row = row.map(v => v ? chalk.grey(v) : v);
    }
    // colorize the whole row when it’s actively tracked or archived
    if (item.tracking) {
      row = row.map(v => v ? chalk.yellow(v) : v);
    }
    if (item.locked) {
      row = row.map(v => v ? chalk.grey(v) : v);
    }
    return row;
  });
}

/**
 * @param {Array<Object>} items
 * @param {Array<ColumnDefinition} columns
 * @return {Array<Array<String>>}
 */
function getTableFooterColumns(items, columns) {
  assert(Array.isArray(items), 'expected items to be an array');
  assert(Array.isArray(columns), 'expected columns to be an array');

  return columns.map(columnDefinition => {
    let columnSum;
    if (columnDefinition.reducer) {
      columnSum = items.reduce(columnDefinition.reducer, null);
    }
    if (columnSum && columnDefinition.format) {
      return columnDefinition.format(columnSum);
    }
    return columnSum || undefined;
  });
}

function stripColorColodes(string) {
  const ansiColorRegexp = /\\u001b?\[\d{1,2}m/g;
  return string.replace(ansiColorRegexp, '');
}

/**
 * @param {Array<Object>} data
 * @param {FORMAT} format
 * @param {Array<ColumnDefinition>} columns
 * @return {String}
 */
function formatData(data, format, columns = []) {
  assert(Array.isArray(data), 'expected data to be an array');
  assert(Array.isArray(columns), 'expected columns to be an array');
  assert.strictEqual(typeof format, 'string', 'expected format to be a string');

  // adds table header when there are more than one column defined
  if (columns && columns.length > 0) {
    data.unshift(columns
      .map(columnDefinition => columnDefinition.label)
      .map(v => chalk.bold(v))
    );
  }

  // format the output according to the given format
  switch(format) {
    case FORMAT.JSON: {
      // ignore table header
      const jsonString = JSON.stringify(data.slice(1));
      // remove ansi color codes
      return stripColorColodes(jsonString);
    }
    case FORMAT.TABLE: {
      const tableConfig = {
        border: tableLib.getBorderCharacters('norc'),
        columns,
      };
      return table(data, tableConfig);
    }
    case FORMAT.TEXT:
      // ignore table header
      return data
        .slice(1)
        .map(row => row.join('|'))
        .join('\n');
    default:
      throw new Error(`Unknown output format: ${JSON.stringify(format)}.`);
  }
}

module.exports = {
  FORMAT,
  FORMATS,
  getFormatFromOptions: (options, config) => {
    // get default option from config
    if (options.json) return FORMAT.JSON;
    if (options.plain) return FORMAT.TEXT;
    if (options.pretty) return FORMAT.TABLE;
    if (!config.outputFormat) return FORMAT.DEFAULT;
    return config.outputFormat;
  },
  supportsExtendedFormat,
  formatData,
  compileTableData,
  getTableFooterColumns
};
