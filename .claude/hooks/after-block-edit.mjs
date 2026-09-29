#!/usr/bin/env node
/**
 * PostToolUse hook: keeps compiled CSS and lint status current after an edit.
 *
 * Claude Code pipes the tool payload in as JSON on stdin. We pull the edited
 * file path out of it and react by extension:
 *   *.scss -> `npx sass` on that one file (same compiler and options gulp uses)
 *   *.js   -> `npx eslint --fix <file>` (airbnb-base autofix)
 *
 * Deliberately NOT `gulp styles`: that task recompiles every block, so a single
 * edit rewrites CSS for blocks you never touched. Run `npm run build:css` when
 * you actually want a full rebuild.
 *
 * Anything else is ignored. The hook never fails the tool call: it exits 0 and
 * reports problems through the `systemMessage` field instead.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const WATCHED_DIRS = ['blocks', 'styles', 'scripts'];

function readStdin() {
  return new Promise((resolve) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { raw += chunk; });
    process.stdin.on('end', () => resolve(raw));
  });
}

/** @returns {string} the absolute path of the edited file, or '' when absent */
function filePathFrom(raw) {
  try {
    const payload = JSON.parse(raw);
    return payload?.tool_input?.file_path
      || payload?.tool_response?.filePath
      || '';
  } catch {
    return '';
  }
}

/** only act on source we own — never on node_modules or files outside the repo */
function isWatched(file) {
  const rel = path.relative(process.cwd(), file);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  const [top] = rel.split(path.sep);
  return WATCHED_DIRS.includes(top);
}

function run(command, args) {
  // shell: true so the npx.cmd shim resolves on Windows
  execFileSync(command, args, { stdio: 'pipe', shell: true, cwd: process.cwd() });
}

function report(message) {
  process.stdout.write(`${JSON.stringify({ systemMessage: message, suppressOutput: true })}\n`);
}

const file = filePathFrom(await readStdin());

if (file && isWatched(file)) {
  const ext = path.extname(file).toLowerCase();

  try {
    if (ext === '.scss') {
      // partials (_foo.scss) have no output of their own; dependents need a full build
      if (path.basename(file).startsWith('_')) {
        report(`${path.basename(file)} is a partial — run \`npm run build:css\` to rebuild dependents.`);
      } else {
        run('npx', ['sass', file, file.replace(/\.scss$/i, '.css'), '--style=expanded']);
        report(`Recompiled CSS for ${path.basename(file)}`);
      }
    } else if (ext === '.js') {
      run('npx', ['eslint', '--fix', file]);
    }
  } catch (error) {
    const detail = [error.stdout, error.stderr]
      .map((buffer) => (buffer ? buffer.toString().trim() : ''))
      .filter(Boolean)
      .join('\n');
    report(`${ext === '.scss' ? 'gulp styles' : 'eslint --fix'} failed for ${path.basename(file)}:\n${detail || error.message}`);
  }
}

process.exit(0);
