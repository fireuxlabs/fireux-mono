import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { sharedArchitectureContracts } from '../runtime/models/industry-comparison.ts'
const comparisonSource = readFileSync(
  new URL('../runtime/utils/compare-industries.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const compareIndustries = compileFunction(
  `${stripTypeScriptTypes(comparisonSource)};return compareIndustries`,
  ['sharedArchitectureContracts']
)(sharedArchitectureContracts)
const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const raw = readFileSync(
  resolve(
    root,
    'projects/fireux/fireux-app/app/ignition/industry-comparisons.ts'
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const cases = compileFunction(
  `${stripTypeScriptTypes(raw)};return industryComparisons`,
  ['sharedArchitectureContracts']
)(sharedArchitectureContracts)
test('the first comparison preserves proposed grooming evidence and meaningful domain differences', () => {
  const report = compareIndustries(cases[0])
  assert.equal(report.candidate.id, 'dog-grooming')
  assert.equal(report.candidate.kind, 'proposal')
  assert.ok(report.shared.every((row) => row.candidate.level === 'proposed'))
  assert.notDeepEqual(report.baseline.domain, report.candidate.domain)
  const resources = report.deltas.find((item) => item.id === 'resources')
  assert.equal(resources.kind, 'new-behaviour')
  assert.equal(resources.reuse, 'partial-source')
  assert.match(resources.acceptance, /same groomer or tub/)
  assert.equal(
    report.deltas.find((item) => item.id === 'pets').reuse,
    'needs-implementation'
  )
})
test('a common review dimension with missing evidence remains unverified', () => {
  const report = compareIndustries({
    ...cases[0],
    candidate: { ...cases[0].candidate, contracts: {} },
  })
  assert.ok(report.shared.every((row) => row.candidate.level === 'unverified'))
  assert.match(report.boundary, /interchangeable code/)
})
test('reuse claims and classifications need reviewable evidence and acceptance', () => {
  const delta = cases[0].deltas[0]
  assert.throws(
    () =>
      compareIndustries({
        ...cases[0],
        deltas: [{ ...delta, references: [] }],
      }),
    /source references/
  )
  assert.throws(
    () =>
      compareIndustries({
        ...cases[0],
        deltas: [{ ...delta, acceptance: '' }],
      }),
    /acceptance/
  )
  assert.throws(
    () => compareIndustries({ ...cases[0], deltas: [delta, delta] }),
    /unique/
  )
  assert.throws(
    () => compareIndustries({ ...cases[0], candidate: cases[0].baseline }),
    /distinct/
  )
})
test('all reviewed references resolve and other Apps keep their genuine implementation gaps', () => {
  assert.deepEqual(
    cases.map((item) => item.candidate.id),
    ['dog-grooming', 'granite', 'buenohost', 'fireux']
  )
  for (const comparison of cases) {
    const report = compareIndustries(comparison)
    for (const row of report.shared)
      for (const observation of [row.baseline, row.candidate])
        for (const reference of observation.references)
          assert.ok(existsSync(resolve(root, reference)), reference)
    for (const delta of report.deltas)
      for (const reference of delta.references)
        assert.ok(existsSync(resolve(root, reference)), reference)
  }
  assert.equal(
    cases.find((item) => item.candidate.id === 'granite').candidate.contracts
      .ecosystem.level,
    'partial'
  )
  assert.equal(
    cases
      .find((item) => item.candidate.id === 'fireux')
      .deltas.find((item) => item.id === 'generation').reuse,
    'needs-implementation'
  )
})
