import { cp, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'public');
const destination = join(root, 'dist');

await rm(destination, { recursive: true, force: true });
await cp(source, destination, { recursive: true });

const files = await readdir(destination);
let totalBytes = 0;
for (const file of files) totalBytes += (await stat(join(destination, file))).size;

process.stdout.write(`Static ArNS build: ${destination}\nFiles: ${files.length}\nBytes: ${totalBytes}\n`);
