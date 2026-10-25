import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { reconcileIgnition } from '../runtime/utils/reconcile-ignition.ts'
const brief = {
  id: 'test',
  industry: 'Example',
  outcome: 'Do useful work',
  actors: ['Operator'],
  requirements: [
    {
      id: 'job',
      need: 'Do the job',
      acceptance: 'Observe the completed outcome',
    },
  ],
}
const reference = {
  id: 'reference',
  elements: [
    {
      id: 'capability',
      role: 'capability',
      owner: 'example-domain',
      requirements: ['job'],
      uses: [],
      sourcePaths: [],
    },
  ],
  evidence: [
    {
      requirement: 'job',
      level: 'checks-passed',
      observation: 'Checks pass; journey still pending',
      references: ['test'],
    },
  ],
  learnings: [],
}
test('absent proposal is explicit and reference checks do not prove generation or a journey', () => {
  const report = reconcileIgnition(brief, null, reference)
  assert.equal(report.proposalSupplied, false)
  assert.equal(report.coverage[0].status, 'proposal-not-supplied')
  assert.equal(report.coverage[0].referenceJourneyProved, false)
})
test('declared coverage does not imply semantic equivalence or proved acceptance', () => {
  const proposal = { ...reference, id: 'independent', evidence: [] }
  const report = reconcileIgnition(brief, proposal, reference)
  assert.equal(report.coverage[0].status, 'covered-in-both')
  assert.equal(report.coverage[0].proposalJourneyProved, false)
  assert.match(report.boundary, /independent acceptance/)
})
test('missing and new requirement coverage is distinguishable', () => {
  const empty = { id: 'empty', elements: [], evidence: [], learnings: [] }
  assert.equal(
    reconcileIgnition(brief, empty, reference).coverage[0].status,
    'missing-in-proposal'
  )
  assert.equal(
    reconcileIgnition(brief, reference, empty).coverage[0].status,
    'new-in-proposal'
  )
  assert.equal(
    reconcileIgnition(brief, empty, empty).coverage[0].status,
    'uncovered'
  )
})
test('invalid references, duplicate identities and dependency cycles fail before comparison', () => {
  const element = reference.elements[0]
  assert.throws(
    () =>
      reconcileIgnition(brief, null, {
        ...reference,
        elements: [element, element],
      }),
    /unique/
  )
  assert.throws(
    () =>
      reconcileIgnition(brief, null, {
        ...reference,
        elements: [{ ...element, uses: ['empty'] }],
      }),
    /Unknown assembly/
  )
  assert.throws(
    () =>
      reconcileIgnition(brief, null, {
        ...reference,
        elements: [{ ...element, uses: [element.id] }],
      }),
    /Circular/
  )
  assert.throws(
    () =>
      reconcileIgnition(brief, null, {
        ...reference,
        elements: [{ ...element, requirements: ['unknown'] }],
      }),
    /Unknown requirement/
  )
  assert.throws(
    () =>
      reconcileIgnition(
        {
          ...brief,
          requirements: [...brief.requirements, ...brief.requirements],
        },
        null,
        reference
      ),
    /unique ids/
  )
})
test('Misebox reference sources exist and its business brief is implementation-independent', () => {
  const root = fileURLToPath(new URL('../../../../../', import.meta.url))
  const path = resolve(
    root,
    'projects/fireux/fireux-app/app/ignition/misebox-reference.ts'
  )
  const raw = readFileSync(path, 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const data = compileFunction(
    `${stripTypeScriptTypes(raw)}; return {collectionOrderingBrief,miseboxReference}`
  )()
  assert.doesNotMatch(
    JSON.stringify(data.collectionOrderingBrief),
    /misebox|fireux|runtime|workspace\//i
  )
  for (const element of data.miseboxReference.elements)
    for (const source of element.sourcePaths)
      assert.ok(existsSync(resolve(root, source)), source)
  const report = reconcileIgnition(
    data.collectionOrderingBrief,
    null,
    data.miseboxReference
  )
  assert.ok(
    report.coverage.every(
      (item) => item.observed.length && !item.referenceJourneyProved
    )
  )
})
