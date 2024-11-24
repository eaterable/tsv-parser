'use strict';

/**
 * @typedef {Object} TSVOptions
 * @property {string} [valueSeparator='\t'] - Character used to separate values in a row
 * @property {string} [lineSeparator='\n'] - Character used to separate rows
 */

/**
 * Memory-efficient TSV string iterator
 * @class
 * @implements {Iterator<string[]>}
 * @implements {Iterable<string[]>}
 */
class TSVIterator {
  /**
   * Create a new TSVIterator instance
   * @param {string} raw - Raw TSV string to parse
   * @param {TSVOptions} [options] - Parser options
   */
  constructor(raw, options = {}) {
    this._data = raw;
    this._length = raw.length;
    this._valueSeparator = options.valueSeparator ?? '\t';
    this._lineSeparator = options.lineSeparator ?? '\n';
    this._index = 0;
    this._iterResult = { done: false, value: null };
    this._doneResult = { done: true, value: undefined };
  }

  /**
   * Get an iterator result with the next row
   * @returns {IteratorResult<string[]>}
   */
  next() {
    if (this._index >= this._length) {
      return this._doneResult;
    }

    let lineEndIndex = this._data.indexOf(this._lineSeparator, this._index);
    if (lineEndIndex === -1) {
      lineEndIndex = this._length;
    }

    const line = this._data.slice(this._index, lineEndIndex);
    this._index = lineEndIndex + this._lineSeparator.length;

    this._iterResult.value = line.split(this._valueSeparator);
    return this._iterResult;
  }

  /**
   * Get an iterator for all rows
   * @return {this} Self reference for iteration
   */
  [Symbol.iterator]() {
    return this;
  }
}

/**
 * Convenience methods for parsing TSV data
 */
const TSV = {
  Iterator: TSVIterator,

  /**
   * Parse entire TSV string into array of arrays
   * @param {string} raw - Raw TSV string
   * @param {TSVOptions} [options] - Parser options
   * @returns {string[][]} Parsed rows
   */
  parse(raw, options) {
    return new TSVIterator(raw, options);
  },

  /**
   * Get headers (first row) from TSV string
   * @param {string} raw - Raw TSV string
   * @param {TSVOptions} [options] - Parser options
   * @returns {string[]} Header values
   */
  headers(raw, options) {
    const iterator = new TSVIterator(raw, options);
    const result = iterator.next();
    return result.done ? [] : result.value;
  },

  /**
   * Get data rows (excluding headers) from TSV string
   * @param {string} raw - Raw TSV string
   * @param {TSVOptions} [options] - Parser options
   * @returns {string[][]} Data rows
   */
  rows(raw, options) {
    const iterator = new TSVIterator(raw, options);
    iterator.next(); // Skip headers
    return iterator;
  }
};

module.exports = TSV;
