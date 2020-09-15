const gzipsize = require('gzip-size');
const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

async function main() {
  const fileSize = await gzipsize(fs.readFileSync(
    path.resolve(__dirname, './dist', 'index.js')
  ));
  if (fileSize > pkg.size.max) {
    console.error(`Dist file too large: Max allowed ${pkg.size.max}, actual ${fileSize}`)
    process.exit(1);
  }
}

main();