// @fireux-script
// last_used: 2026-07-15
// usage_note: shared filesystem policy for guard modules.
// FILE: scripts/guards/_lib/filesystem-policy.mjs

export const COMMON_PACKAGE_REQUIRED_L1 = Object.freeze([
  'package.json',
  'registry.json',
  'README.md',
  'src',
  'tsconfig.json',
])

export const GENERATED_DIRECTORY_NAMES = Object.freeze([
  '.cache',
  '.data',
  '.firebase',
  '.nitro',
  '.nuxt',
  '.nyc_output',
  '.output',
  '.pnpm-store',
  'build',
  'coverage',
  'dist',
  'node_modules',
])

export const GENERATED_FILE_NAMES = Object.freeze([
  '.DS_Store',
  'firebase-debug.log',
])

export const LOCAL_GENERATED_NOISE_NAMES = Object.freeze([
  ...GENERATED_DIRECTORY_NAMES,
  ...GENERATED_FILE_NAMES,
  'tsconfig.tsbuildinfo',
])

export function isGeneratedArtifactPath(file) {
  const segments = file.split('/')
  const fileName = segments.at(-1) ?? ''

  return (
    segments.some((segment) => GENERATED_DIRECTORY_NAMES.includes(segment)) ||
    GENERATED_FILE_NAMES.includes(fileName) ||
    fileName.endsWith('.tsbuildinfo')
  )
}

export function inspectLevelOne(entries, options) {
  const {
    required,
    allowed = [],
    forbidden = [],
    noise = LOCAL_GENERATED_NOISE_NAMES,
    isAllowed = () => false,
  } = options

  const requiredSet = new Set(required)
  const allowedSet = new Set(allowed)
  const forbiddenSet = new Set(forbidden)
  const noiseSet = new Set(noise)

  return {
    missing: required.filter((entry) => !entries.includes(entry)),
    forbidden: entries.filter((entry) => forbiddenSet.has(entry)),
    unexpected: entries.filter((entry) => {
      if (forbiddenSet.has(entry)) return false
      if (requiredSet.has(entry) || allowedSet.has(entry) || noiseSet.has(entry)) {
        return false
      }
      return !isAllowed(entry)
    }),
  }
}
