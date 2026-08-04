// @fireux-script
// last_used: 2026-08-04
// usage_note: run through pnpm guard; locks package-relative internals and resolved ESLint restrictions.

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { ESLint } from 'eslint'

const IMPORT_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)['"]([^'"]+)['"]/g
const RUNTIME_EXPLICIT_EXTENSIONS = ['vue', 'css', 'scss']

function packageRecords(repoRoot) {
  const records = []

  for (const family of ['core', 'ecosystem', 'extensions']) {
    const familyRoot = path.join(repoRoot, 'packages', family)
    for (const entry of readdirSync(familyRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const directory = path.join(familyRoot, entry.name)
      const manifestPath = path.join(directory, 'package.json')
      if (!existsSync(manifestPath)) continue
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      const name = String(manifest.name || '').trim()
      if (name) records.push({ name, directory, manifest, manifestPath })
    }
  }

  return records
}

function sourceFiles(repoRoot, directory) {
  const output = execFileSync(
    'rg',
    ['--files', path.relative(repoRoot, path.join(directory, 'src'))],
    { cwd: repoRoot, encoding: 'utf8' }
  )

  return output.split('\n').filter((file) => /\.(?:js|ts|vue)$/.test(file))
}

function assertAuthoredImports(repoRoot) {
  const violations = []

  for (const record of packageRecords(repoRoot)) {
    for (const file of sourceFiles(repoRoot, record.directory)) {
      const source = readFileSync(path.join(repoRoot, file), 'utf8')
      for (const match of source.matchAll(IMPORT_SPECIFIER)) {
        const specifier = match[1]
        if (
          specifier === record.name ||
          specifier.startsWith(`${record.name}/`)
        ) {
          violations.push(`${file}: package self-import ${specifier}`)
        }
        if (
          specifier.startsWith('#fireux-') ||
          specifier.startsWith('@fireux-')
        ) {
          violations.push(`${file}: internal generated alias ${specifier}`)
        }
        if (/^fireux-[^/]+\/runtime\/.+\.ts$/.test(specifier)) {
          violations.push(
            `${file}: runtime package import must be extensionless ${specifier}`
          )
        }
      }
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ Package import boundary drift:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        'Package internals use relative imports; consumers use package exports.',
      ].join('\n')
    )
  }
}

function assertRuntimePackageExports(repoRoot) {
  const violations = []
  const expectedCodeTarget = {
    types: './src/runtime/*.ts',
    default: './src/runtime/*.ts',
  }

  for (const record of packageRecords(repoRoot)) {
    const exportsMap = record.manifest.exports || {}
    if (!Object.prototype.hasOwnProperty.call(exportsMap, './runtime/*')) {
      continue
    }

    if (
      JSON.stringify(exportsMap['./runtime/*']) !==
      JSON.stringify(expectedCodeTarget)
    ) {
      violations.push(
        `${path.relative(repoRoot, record.manifestPath)}: ./runtime/* must resolve extensionless code imports to src/runtime/*.ts`
      )
    }

    const typeMap = record.manifest.typesVersions?.['*'] || {}
    if (JSON.stringify(typeMap['runtime/*']) !== '["src/runtime/*.ts"]') {
      violations.push(
        `${path.relative(repoRoot, record.manifestPath)}: typesVersions runtime/* must resolve to src/runtime/*.ts`
      )
    }

    for (const extension of RUNTIME_EXPLICIT_EXTENSIONS) {
      const exportKey = `./runtime/*.${extension}`
      const target = `./src/runtime/*.${extension}`
      const expectedExport = { types: target, default: target }
      if (
        JSON.stringify(exportsMap[exportKey]) !== JSON.stringify(expectedExport)
      ) {
        violations.push(
          `${path.relative(repoRoot, record.manifestPath)}: ${exportKey} must preserve its explicit asset suffix`
        )
      }
      if (
        JSON.stringify(typeMap[`runtime/*.${extension}`]) !==
        JSON.stringify([`src/runtime/*.${extension}`])
      ) {
        violations.push(
          `${path.relative(repoRoot, record.manifestPath)}: typesVersions runtime/*.${extension} is not canonical`
        )
      }
    }

    if (Object.prototype.hasOwnProperty.call(exportsMap, './runtime/*.ts')) {
      violations.push(
        `${path.relative(repoRoot, record.manifestPath)}: ./runtime/*.ts duplicates the canonical extensionless code path`
      )
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ Runtime package export drift:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        'Use extensionless runtime code imports; keep suffixes only for Vue and asset files.',
      ].join('\n')
    )
  }
}

function restrictedGroups(config) {
  const rule = config.rules?.['no-restricted-imports']
  const patterns = Array.isArray(rule) ? rule[1]?.patterns || [] : []
  return patterns.flatMap((pattern) =>
    pattern && typeof pattern === 'object' && Array.isArray(pattern.group)
      ? pattern.group
      : []
  )
}

async function assertResolvedEslintConfig(repoRoot) {
  const eslint = new ESLint({ cwd: repoRoot })
  const fixtures = [
    {
      file: 'packages/core/fireux-core/src/module.ts',
      required: ['fireux-core/*', '#fireux-kitchens/*', '@fireux-*'],
    },
    {
      file: 'packages/extensions/fireux-kitchens/src/module.ts',
      required: ['fireux-kitchens/*', '#fireux-core-runtime/*', '@fireux-*'],
    },
  ]

  for (const fixture of fixtures) {
    const config = await eslint.calculateConfigForFile(fixture.file)
    const groups = restrictedGroups(config)
    for (const pattern of fixture.required) {
      assert.ok(
        groups.includes(pattern),
        `${fixture.file} resolved ESLint config must restrict ${pattern}.`
      )
    }
  }
}

export async function run({ repoRoot = process.cwd() } = {}) {
  assertAuthoredImports(repoRoot)
  assertRuntimePackageExports(repoRoot)
  await assertResolvedEslintConfig(repoRoot)
  console.log('[guard] ✅ package import boundaries valid')
}
