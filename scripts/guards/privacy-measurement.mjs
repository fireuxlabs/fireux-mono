import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const TRACKER_PATTERNS = [
  /@nuxtjs\/google-analytics/i,
  /firebase\/analytics/i,
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /\bgtag\s*\(/i,
  /\bfbq\s*\(/i,
  /connect\.facebook\.net/i,
  /@segment\/analytics/i,
  /mixpanel-browser/i,
  /posthog-js/i,
]

const ANALYTICS_STORAGE_PATTERNS = [
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bdocument\.cookie\b/,
  /\bnavigator\.userAgent\b/,
  /\bdevicePixelRatio\b/,
  /\bcanvas\b/i,
]

const AUTHORED_TEXT_FILE = /\.(?:[cm]?[jt]s|vue|json|ya?ml|md|html|css|scss)$/

async function authoredFiles(repoRoot) {
  const manifest = readFileSync(join(repoRoot, 'pnpm-workspace.yaml'), 'utf8')
  if (!manifest.includes("packages/core/*")) {
    throw new Error('privacy measurement guard requires the canonical workspace.')
  }

  const { execFileSync } = await import('node:child_process')
  return execFileSync(
    'rg',
    [
      '--files',
      'packages',
      'projects',
      '-g',
      '!**/dist/**',
      '-g',
      '!**/.output/**',
      '-g',
      '!**/.nuxt/**',
      '-g',
      '!**/node_modules/**',
    ],
    { cwd: repoRoot, encoding: 'utf8' }
  )
    .split('\n')
    .filter(file => file && AUTHORED_TEXT_FILE.test(file))
}

export async function run({ repoRoot }) {
  const files = await authoredFiles(repoRoot)
  const violations = []

  for (const file of files) {
    const source = readFileSync(join(repoRoot, file), 'utf8')
    for (const pattern of TRACKER_PATTERNS) {
      if (pattern.test(source)) violations.push(`${file}: forbidden tracker ${pattern}`)
    }

    if (/analytics|telemetry|measurement/i.test(file)) {
      for (const pattern of ANALYTICS_STORAGE_PATTERNS) {
        if (pattern.test(source)) {
          violations.push(`${file}: analytics may not use ${pattern}`)
        }
      }
    }
  }

  const coreConfig = readFileSync(
    join(repoRoot, 'packages/core/fireux-core/src/config/app/fireux.config.ts'),
    'utf8'
  )
  if (/MEASUREMENT_ID|measurementId/.test(coreConfig)) {
    violations.push('FireUX Core must not expose a Firebase analytics measurement id.')
  }

  if (violations.length) {
    throw new Error(`Privacy-first measurement drift:\n- ${violations.join('\n- ')}`)
  }

  console.log('[guard] ✅ privacy-first measurement boundary valid')
}
