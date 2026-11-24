import { copyFileSync, mkdirSync, readFileSync, statSync, chmodSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "";
if (!outDir) process.exit(1);
const buf = readFileSync(src);
// Full 8-byte PNG signature, then the first chunk must be a 13-byte IHDR.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (buf.length < 33 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) process.exit(1);
if (buf.readUInt32BE(8) !== 13 || buf.toString("latin1", 12, 16) !== "IHDR") process.exit(1);
if (buf.length > 1048576) process.exit(1);
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width === 0 || height === 0 || width > 1024 || height > 1024) process.exit(1);
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(src, dest);
chmodSync(dest, 0o644);
if (statSync(dest).size !== buf.length) process.exit(1);
// Compare the written bytes with the source, not only the size.
if (!readFileSync(dest).equals(buf)) process.exit(1);
