const {writeFileSync} = require('node:fs');
const TSV = require('../index.js');

/**
 * Generate sample TSV data of specified size
 * @param {number} rows Number of rows to generate
 * @param {number} cols Number of columns to generate
 * @returns {string} Generated TSV string
 */
function generateTSV(rows, cols) {
  const header = Array.from({length: cols}, (_, i) => `col${i + 1}`).join('\t');
  const dataRows = Array.from({length: rows}, (_, i) =>
    Array.from({length: cols}, (_, j) => `val${i + 1}_${j + 1}`).join('\t')
  );

  return [header, ...dataRows].join('\n');
}

/**
 * Calculate a simple checksum of the data to prevent optimization
 * @param {string[]} row Array of strings
 * @returns {number} Checksum value
 */
function calculateChecksum(row) {
  return row.reduce((acc, val) => {
    // Use a non-optimizable operation
    return acc + (val.length * 31) ^ (val.charCodeAt(0) || 0);
  }, 0);
}

/**
 * Measure memory usage of a function
 * @param {Function} fn Function to measure
 * @param {string} label Label for the measurement
 */
async function measureMemory(fn, label) {
  // Wait for any previous operations to settle
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Force garbage collection if possible
  if (global.gc) {
    global.gc();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const baseline = process.memoryUsage();
  console.log(`\n${label} - Starting measurement`);
  console.log('Baseline memory:', formatMemory(baseline));

  // Run the function and track peak memory
  const startTime = performance.now();
  const checksum = await fn();
  const duration = performance.now() - startTime;

  // Measure immediately after execution (before GC)
  const afterExec = process.memoryUsage();
  console.log('After execution:', formatMemory(afterExec));
  console.log('Duration:', duration.toFixed(2), 'ms');
  console.log('Checksum:', checksum);

  // Calculate memory allocated during processing
  const peakAllocation = {
    heapUsed: afterExec.heapUsed - baseline.heapUsed,
    rss: afterExec.rss - baseline.rss,
    external: afterExec.external - baseline.external
  };

  // Force GC for next test
  if (global.gc) {
    global.gc();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return {
    label,
    duration,
    checksum,
    // Return the peak allocation instead of post-GC values
    heapUsed: peakAllocation.heapUsed,
    rss: peakAllocation.rss,
    external: peakAllocation.external
  };
}

/**
 * Format memory usage numbers
 * @param {NodeJS.MemoryUsage} memory
 * @returns {object}
 */
function formatMemory(memory) {
  return {
    heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
  };
}

/**
 * Run all benchmarks
 */
async function runBenchmarks() {
  // Generate test data
  console.log('Generating test data...');
  const SIZE = {
    ROWS: 100000,
    COLS: 100
  };

  const data = generateTSV(SIZE.ROWS, SIZE.COLS);
  console.log(`Generated ${SIZE.ROWS} rows x ${SIZE.COLS} columns`);
  console.log(`Data size: ${(data.length / 1024 / 1024).toFixed(2)} MB`);

  const results = [];

  // Run each test sequentially
  results.push(await measureMemory(async () => {
    let checksum = 0;
    for (const row of TSV.parse(data)) {
      checksum ^= calculateChecksum(row);
    }
    return checksum;
  }, 'TSV.parse'));

  results.push(await measureMemory(async () => {
    let checksum = 0;
    const headers = TSV.headers(data);
    checksum ^= calculateChecksum(headers);
    const rows = TSV.rows(data);
    for (const row of rows) {
      checksum ^= calculateChecksum(row);
    }
    return checksum;
  }, 'TSV.headers + TSV.rows'));

  results.push(await measureMemory(async () => {
    let checksum = 0;
    const rows = data.split('\n').map(row => row.split('\t'));
    for (const row of rows) {
      checksum ^= calculateChecksum(row);
    }
    return checksum;
  }, 'String.split (Naive)'));

  // Output results table
  console.log('\nResults:');
  console.table(results.map(r => ({
    Method: r.label,
    'Duration (ms)': r.duration.toFixed(2),
    'Heap Used (MB)': (r.heapUsed / 1024 / 1024).toFixed(2),
    'RSS (MB)': (r.rss / 1024 / 1024).toFixed(2),
    'External (MB)': (r.external / 1024 / 1024).toFixed(2),
    'Checksum': r.checksum
  })));

  // Save results as JSON for potential further analysis
  writeFileSync('scripts/membench.json', JSON.stringify(results, null, 2));
}

// Run with --expose-gc to enable garbage collection
if (!global.gc) {
  console.warn('For more accurate results, run with --expose-gc flag:');
  console.warn('node --expose-gc scripts/membench.js');
}

runBenchmarks().catch(console.error);
