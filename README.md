# TSV Parser

⚡️ Memory-efficient TSV string parser using native JavaScript iterators

## 🌟 Features

- **Memory Efficient**: Uses JavaScript iterators for streaming-like parsing
- **Zero Dependencies**: Pure JavaScript implementation
- **Flexible**: Configurable value and line separators
- **TypeScript Ready**: Full TypeScript support with type definitions
- **Modern API**: Uses iterator pattern for efficient parsing
- **Iterable**: Works with `for...of` loops and spread operator
- **Minimal**: Focused on doing one thing well

Here's how our TSV parser [performs](scripts/membench.js) compared to naive approaches:

| Method                 | Duration (ms) | Heap Used (MB) | RSS* (MB) | External (MB) |
|------------------------|---------------|----------------|-----------|---------------|
| TSV.parse              | 377.25        | 13.14          | 1.30      | 0.04          |
| String.split (Naive)   | 822.36        | 394.59         | 393.60    | 0.00          |

\* RSS (Resident Set Size) represents the total physical memory (RAM) used by the process

## 🚀 Installation

```bash
npm install @eaterable/tsv-parser
```

## ✨ Usage

### Basic Usage

```javascript
import TSV from '@eaterable/tsv-parser';

// Example TSV data
const data = 'name\tage\tcity\nAlice\t30\tNew York\nBob\t25\tLondon';

// Parse all rows at once (includes headers)
const allRows = [...TSV.parse(data)];
console.log(allRows);
// Output:
// [
//   ['name', 'age', 'city'],
//   ['Alice', '30', 'New York'],
//   ['Bob', '25', 'London']
// ]

// Get just the headers
const headers = TSV.headers(data);
console.log(headers);
// Output: ['name', 'age', 'city']

// Iterate over data rows (excluding headers)
for (const row of TSV.rows(data)) {
  console.log(row);
}
// Output:
// ['Alice', '30', 'New York']
// ['Bob', '25', 'London']
```

### Custom Separators

```javascript
const customData = 'name|age|city%Alice|30|New York%Bob|25|London';
const options = {
  valueSeparator: '|',  // Default: '\t'
  lineSeparator: '%'    // Default: '\n'
};

const rows = [...TSV.parse(customData, options)];
```

### Low-Level Iterator Usage

```javascript
// Using the iterator directly
const iterator = new TSV.Iterator(data);
for (const row of iterator) {
  console.log(row);
}
```

## 🔍 API Reference

### `TSV.parse(raw: string, options?: TSVParserOptions): Iterable<string[]>`

Creates an iterable that yields all rows (including headers) from the TSV string.

- `raw`: The raw TSV string to parse
- `options`: Optional configuration object
  - `valueSeparator`: Character used to separate values (default: `'\t'`)
  - `lineSeparator`: Character used to separate lines (default: `'\n'`)

### `TSV.headers(raw: string, options?: TSVParserOptions): string[]`

Returns just the headers (first row) from the TSV string.

### `TSV.rows(raw: string, options?: TSVParserOptions): Iterable<string[]>`

Creates an iterable that yields data rows (excluding headers) from the TSV string.

### `TSV.Iterator`

The underlying iterator class used for parsing. Useful for advanced use cases or when you need more control over the iteration process.

## 💡 Why Use This Parser?

- **Memory Efficiency**: The iterator-based design means it only processes one row at a time, making it ideal for large datasets
- **Flexibility**: Works with both standard TSV and custom-separated values
- **Simplicity**: Clean API that works well with modern JavaScript features
- **Type Safety**: Full TypeScript support for better development experience

## 🔋 Browser Support

This package works in all modern browsers and Node.js environments that support:
- ES2015+ features
- Iterators and Iterables
- `Symbol.iterator`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for memory-efficient parsing of large TSV files
- Built with modern JavaScript features for optimal performance
- Follows the iterator pattern for streaming-like data processing
