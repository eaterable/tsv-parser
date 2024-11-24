export interface TSVParserOptions {
  valueSeparator?: string;
  lineSeparator?: string;
}

export interface TSVParserIterator extends Iterable<string[]> {
  [Symbol.iterator](): IterableIterator<string[]>;
}

declare class TSVIterator implements Iterable<string[]> {
  constructor(raw: string, options?: TSVParserOptions);
  [Symbol.iterator](): IterableIterator<string[]>;
}

declare namespace TSV {
  export function parse(raw: string, options?: TSVParserOptions): TSVParserIterator;
  export function headers(raw: string, options?: TSVParserOptions): string[];
  export function rows(raw: string, options?: TSVParserOptions): IterableIterator<string[]>;
  export { TSVIterator as Iterator };
}

export default TSV;
