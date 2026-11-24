import { copyFileSync, mkdirSync, readFileSync, statSync, chmodSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "";
if (!outDir) process.exit(1);
const buf = readFileSync(src);
if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) process.exit(1);
if (buf.length > 1048576) process.exit(1);
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width > 1024 || height > 1024) process.exit(1);
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(src, dest);
chmodSync(dest, 0o644);
if (statSync(dest).size !== buf.length) process.exit(1);
