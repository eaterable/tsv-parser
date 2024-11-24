'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const TSV = require('./index.js');

test('@eaterable/tsv-parser', async (t) => {
  await t.test('parses basic TSV string', () => {
    const tsv = 'a\tb\tc\nd\te\tf';
    const rows = TSV.parse(tsv);

    assert.deepEqual([...rows], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f']
    ]);
  });

  await t.test('supports custom separators', () => {
    const tsv = 'a|b|c*d|e|f';
    const rows = TSV.parse(tsv, {
      valueSeparator: '|',
      lineSeparator: '*'
    });

    assert.deepEqual([...rows], [
      ['a', 'b', 'c'],
      ['d', 'e', 'f']
    ]);
  });

  await t.test('provides access to headers', () => {
    const tsv = 'col1\tcol2\tcol3\nval1\tval2\tval3';
    const headers = TSV.headers(tsv);

    assert.deepEqual(headers, ['col1', 'col2', 'col3']);
  });

  await t.test('provides access to data rows', () => {
    const tsv = 'h1\th2\th3\nv1\tv2\tv3\nv4\tv5\tv6';
    const rows = TSV.rows(tsv);

    assert.deepEqual([...rows], [
      ['v1', 'v2', 'v3'],
      ['v4', 'v5', 'v6']
    ]);
  });

  await t.test('handles empty string', () => {
    const rows = TSV.parse('');
    assert.deepEqual([...rows], []);

    const headers = TSV.headers('');
    assert.deepEqual([...headers], []);

    const dataRows = TSV.rows('');
    assert.deepEqual([...dataRows], []);
  });

  await t.test('provides static create method', () => {
    const tsv = 'a\tb\nc\td';
    for (const row of new TSV.Iterator(tsv)) {
      assert(Array.isArray(row));
    }
  });

  await t.test('provides static iterator method', () => {
    const tsv = 'a\tb\nc\td';
    const rows = TSV.parse(tsv);
    assert(typeof rows[Symbol.iterator] === 'function');
  });

  await t.test('handles missing newline at end', () => {
    const tsv = 'a\tb\nc\td\ne\tf';
    const withNewline = tsv + '\n';

    const rows1 = [...TSV.parse(tsv)];
    const rows2 = [...TSV.parse(withNewline)];

    assert.deepEqual(rows1, rows2);
  });
});
