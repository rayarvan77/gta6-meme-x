// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: the house reads the post from X (its first
// picture, then its text) and hands that to the judge. This program's only job
// is to hand the post's address over: it reads POST.json from the repository
// root, checks it names a real X post, and copies it to the output directory
// where the gate reads it.
//
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// It prints nothing on success. It refuses a placeholder POST.json, so the
// starter cannot pass as it stands: replace the placeholder with your post's
// address (https://x.com/<handle>/status/<id>) before you submit.
//
// Deterministic: no network, no wall clock, no files outside the repository.
// The two runs of an entry write the same bytes.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output.
const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A real X post address: https://x.com/<handle>/status/<digits>, or the same
// on twitter.com. The placeholder ships as https://x.com/<handle>/status/<id>,
// which this pattern refuses.
const POST_URL = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+\/?$/;

function fail(message: string): never {
  console.error(`gta6-meme-x-01: ${message}`);
  process.exit(1);
}

const postPath = join(BOT_DIR, 'POST.json');

let raw: string;
try {
  raw = readFileSync(postPath, 'utf8');
} catch (err) {
  fail(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
}

let post: unknown;
try {
  post = JSON.parse(raw);
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

if (typeof post !== 'object' || post === null || Array.isArray(post)) {
  fail('POST.json must be a JSON object naming the post, {"url": "..."}');
}

const url = (post as { url?: unknown }).url;
if (typeof url !== 'string' || !POST_URL.test(url)) {
  fail(
    'POST.json must name a real X post address, ' +
      'https://x.com/<handle>/status/<id> — a placeholder is refused',
  );
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  fail(`POST.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
}

// The gate reads the copy, so confirm it is byte for byte the file we
// validated above: a partial copy would hand in a different post.
if (readFileSync(join(OUTPUT_DIR, 'POST.json'), 'utf8') !== raw) {
  fail('the copied POST.json differs from the repository copy');
}
