import { execSync } from 'node:child_process';

// Use name-status to identify deleted files and ignore them in validation
const raw = execSync('git diff --name-status --cached', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const parsePathFromStatus = (line) => {
  // Formats:
  //  M path
  //  A path
  //  D path
  //  R100 old new  (take new)
  //  C100 old new  (take new)
  const parts = line.split(/\t+/);
  const code = parts[0];
  if (!code) return null;
  const op = code[0];
  if (op === 'R' || op === 'C') {
    return parts[2] || null; // new path
  }
  // For M/A/T/etc., path is parts[1]
  return parts[1] || null;
};

const isDeleted = (line) => line.startsWith('D');
const changedPaths = raw
  .filter((line) => !isDeleted(line))
  .map(parsePathFromStatus)
  .filter(Boolean);

const isMd = (p) => p.toLowerCase().endsWith('.md');
const allowed = (p) =>
  p === 'README.md' ||
  p === 'CONTRIBUTING.md' ||
  p.startsWith('docs/') ||
  p.startsWith('copilot-documentation/') ||
  /^packages\/[^/]+\/[^/]+\/docs\//.test(p) ||
  /^projects\/[^/]+\/[^/]+\/docs\//.test(p);

const bad = changedPaths.filter((p) => isMd(p) && !allowed(p));
if (bad.length) {
  console.error(
    '\u274c Markdown outside allowed docs locations:\n' +
      bad.map((b) => ' - ' + b).join('\n')
  );
  process.exit(1);
}
