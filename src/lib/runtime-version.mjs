import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const runtimeFiles = [
  'public/runtime/consultation-data.js',
  'public/runtime/customer-fixtures.js',
  'public/runtime/customer.js',
  'public/runtime/address-map.js',
  'public/runtime/address-map-engine.js',
  'public/assets/data/thailand/delivery-map-style.json',
];
let cachedSignature;
let cachedVersion;

// Dev requests from /flow share a version until one of the source files changes.
export function runtimeVersion(root = process.cwd()) {
  const paths = runtimeFiles.map((file) => join(root, file));
  const signature = paths
    .map((path) => {
      const stat = statSync(path);
      return `${path}:${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
    })
    .join('|');
  if (signature !== cachedSignature) {
    const hash = createHash('sha256');
    for (const path of paths) hash.update(readFileSync(path));
    cachedVersion = hash.digest('hex').slice(0, 12);
    cachedSignature = signature;
  }
  return cachedVersion;
}
