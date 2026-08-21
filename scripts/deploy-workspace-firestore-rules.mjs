#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-20
// usage_note: compile, inspect, and evidence-gate the small Workspace-Entity ecosystem Rules releases.

import { createHash } from 'node:crypto'
import process from 'node:process'
import { readFile, stat } from 'node:fs/promises'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { parseArgs } from './_lib/args.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const API = 'https://firebaserules.googleapis.com/v1'
const EVIDENCE_FORMAT = 'fireux-firestore-entity-canon-evidence/1'
const EVIDENCE_MAX_AGE_MS = 6 * 60 * 60 * 1000
const CONFIG = Object.freeze({
  fireux: {
    projectId: 'fireux-2005',
    databaseId: 'fireux',
    rulesPath: new URL('./firebase/fireux/firestore.rules', import.meta.url),
    exportUri:
      'gs://fireux-2005-firestore-migrations/entity-canon-20260820T184348Z',
    policy: 'deny-all',
  },
  granite: {
    projectId: 'granite-ecosystem',
    databaseId: 'granite',
    rulesPath: new URL('./firebase/granite/firestore.rules', import.meta.url),
    exportUri:
      'gs://granite-ecosystem-firestore-migrations/entity-canon-20260820T184348Z',
    policy: 'deny-all',
  },
  buenohost: {
    projectId: 'buenohost-ecosystem',
    databaseId: 'buenohost',
    rulesPath: new URL('./firebase/buenohost/firestore.rules', import.meta.url),
    exportUri:
      'gs://buenohost-ecosystem-firestore-migrations/entity-canon-20260820T184348Z',
    policy: 'trusted-server-only',
  },
})

const args = parseArgs(process.argv.slice(2))
const selectedEcosystem = String(args.ecosystem || '').trim()
const promoteProduction = args['promote-production'] === true

if (args.help) {
  console.log(`
Compile and inspect the small Workspace-Entity ecosystem Rules releases:
  node scripts/deploy-workspace-firestore-rules.mjs --check
  node scripts/deploy-workspace-firestore-rules.mjs --check --ecosystem fireux

Promote one reviewed source after a fresh Entity migration audit:
  node scripts/deploy-workspace-firestore-rules.mjs \
    --promote-production --ecosystem fireux \
    --entity-evidence /private/tmp/<evidence>.json \
    --confirm promote:<project>:<database>:<source-sha256>

Every release mutation writes a mode-0600 release preimage under /private/tmp.
${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const check = args.check === true || !promoteProduction
if (check === promoteProduction) {
  throw new Error('Choose exactly one of --check or --promote-production.')
}
if (selectedEcosystem && !CONFIG[selectedEcosystem]) {
  throw new Error(`Unknown ecosystem: ${selectedEcosystem}.`)
}
if (promoteProduction && !selectedEcosystem) {
  throw new Error('--promote-production requires --ecosystem.')
}

const sha256 = (value) =>
  createHash('sha256')
    .update(String(value ?? ''))
    .digest('hex')

for (const ecosystem of selectedEcosystem
  ? [selectedEcosystem]
  : Object.keys(CONFIG)) {
  await inspectOrPromote(ecosystem, CONFIG[ecosystem])
}

async function inspectOrPromote(ecosystem, config) {
  const content = await readFile(config.rulesPath, 'utf8')
  assertPolicy(content, config.policy)
  const source = { files: [{ name: 'firestore.rules', content }] }
  const sourceSha256 = sha256(content)
  const resolved = await resolveFirebaseAdminCredential({
    args,
    scope: ecosystem,
    projectId: config.projectId,
  })
  const access = await resolved.credential.getAccessToken()
  const accessToken = String(access?.access_token || '').trim()
  if (!accessToken) {
    throw new Error(`${ecosystem}: Firebase credential returned no token.`)
  }
  const api = createApi(config.projectId, accessToken)
  const compilation = await api(`projects/${config.projectId}:test`, {
    method: 'POST',
    body: { source, testSuite: { testCases: [] } },
  })
  const issues = (compilation.issues || []).filter(
    (issue) => issue.severity === 'ERROR' || issue.severity === 'WARNING'
  )
  if (issues.length) {
    throw new Error(
      `${ecosystem}: Rules compilation issues: ${JSON.stringify(issues)}`
    )
  }

  const releaseName = `projects/${config.projectId}/releases/cloud.firestore/${config.databaseId}`
  const currentRelease = await api(releaseName, { allowNotFound: true })
  const currentRuleset = currentRelease
    ? await api(currentRelease.rulesetName)
    : null
  const deployedContent = currentRuleset?.source?.files?.find(
    (file) => file.name === 'firestore.rules'
  )?.content
  const deployedSha256 = deployedContent ? sha256(deployedContent) : null

  if (!promoteProduction) {
    console.log(
      JSON.stringify(
        {
          mode: 'check',
          ecosystem,
          projectId: config.projectId,
          databaseId: config.databaseId,
          credentialSource: resolved.source,
          sourceSha256,
          deployedSha256,
          exact: deployedContent === content,
          release: currentRelease?.name || null,
          ruleset: currentRelease?.rulesetName || null,
          issues: compilation.issues || [],
        },
        null,
        2
      )
    )
    return
  }

  await assertEntityEvidence(ecosystem, config)
  const confirmation = `promote:${config.projectId}:${config.databaseId}:${sourceSha256}`
  if (String(args.confirm || '') !== confirmation) {
    throw new Error(`Promotion requires --confirm ${confirmation}`)
  }
  if (deployedContent === content) {
    console.log(JSON.stringify({ mode: 'promote', ecosystem, unchanged: true }))
    return
  }

  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const backup = await writeProtectedJsonArtifact({
    path: `/private/tmp/fireux-${ecosystem}-firestore-rules-${stamp}.json`,
    payload: {
      format: 'fireux-workspace-rules-backup/1',
      createdAt: new Date().toISOString(),
      ecosystem,
      projectId: config.projectId,
      databaseId: config.databaseId,
      release: currentRelease,
      ruleset: currentRuleset,
    },
  })
  const ruleset = await api(`projects/${config.projectId}/rulesets`, {
    method: 'POST',
    body: { source },
  })
  const retainedRuleset = await api(ruleset.name)
  const retainedContent = retainedRuleset.source?.files?.find(
    (file) => file.name === 'firestore.rules'
  )?.content
  if (sha256(retainedContent || '') !== sourceSha256) {
    throw new Error(`${ecosystem}: immutable Rules source hash mismatch.`)
  }

  if (currentRelease) {
    await api(releaseName, {
      method: 'PATCH',
      body: {
        release: { name: releaseName, rulesetName: ruleset.name },
        updateMask: 'rulesetName',
      },
    })
  } else {
    await api(`projects/${config.projectId}/releases`, {
      method: 'POST',
      body: { name: releaseName, rulesetName: ruleset.name },
    })
  }

  const verifiedRelease = await api(releaseName)
  const verifiedRuleset = await api(verifiedRelease.rulesetName)
  const verifiedContent = verifiedRuleset.source?.files?.find(
    (file) => file.name === 'firestore.rules'
  )?.content
  if (
    verifiedRelease.rulesetName !== ruleset.name ||
    sha256(verifiedContent || '') !== sourceSha256
  ) {
    throw new Error(`${ecosystem}: production Rules verification failed.`)
  }
  console.log(
    JSON.stringify(
      {
        mode: 'promote',
        ecosystem,
        projectId: config.projectId,
        databaseId: config.databaseId,
        sourceSha256,
        ruleset: ruleset.name,
        releaseUpdateTime: verifiedRelease.updateTime,
        backup,
      },
      null,
      2
    )
  )
}

function assertPolicy(content, policy) {
  if (/allow\s+(?:read|write|read,\s*write)[^;]*if\s+true\s*;/.test(content)) {
    throw new Error('Reviewed Rules must not contain an unconditional allow.')
  }
  if (!content.includes('match /{document=**}')) {
    throw new Error('Reviewed Rules must retain an explicit default boundary.')
  }
  if (policy === 'deny-all' && !content.includes('&& false;')) {
    throw new Error('Deny-all Rules must retain their false write gate.')
  }
  if (policy === 'trusted-server-only' && !content.includes('if false;')) {
    throw new Error('Trusted-server-only Rules must retain their deny gate.')
  }
}

async function assertEntityEvidence(ecosystem, config) {
  const evidencePath = String(args['entity-evidence'] || '').trim()
  if (!evidencePath.startsWith('/private/tmp/')) {
    throw new Error('--entity-evidence must be a protected /private/tmp file.')
  }
  const file = await stat(evidencePath)
  if (!file.isFile() || (file.mode & 0o777) !== 0o600) {
    throw new Error('Entity evidence must be a mode-0600 regular file.')
  }
  const evidence = JSON.parse(await readFile(evidencePath, 'utf8'))
  const age = Date.now() - Date.parse(String(evidence.capturedAt || ''))
  const valid =
    evidence.format === EVIDENCE_FORMAT &&
    evidence.ecosystem === ecosystem &&
    evidence.projectId === config.projectId &&
    evidence.databaseId === config.databaseId &&
    evidence.phase === 'copy' &&
    evidence.creates === 0 &&
    evidence.updates === 0 &&
    evidence.retireUpdates >= 0 &&
    evidence.retireDeletes > 0 &&
    evidence.verified > 0 &&
    Array.isArray(evidence.blockers) &&
    evidence.blockers.length === 0 &&
    evidence.exportUri === config.exportUri &&
    /^[a-f0-9]{64}$/.test(String(evidence.planSha256 || '')) &&
    /^[a-f0-9]{64}$/.test(String(evidence.verifiedSha256 || '')) &&
    Number.isFinite(age) &&
    age >= 0 &&
    age <= EVIDENCE_MAX_AGE_MS
  if (!valid) {
    throw new Error(`${ecosystem}: Entity migration evidence is not valid.`)
  }
}

function createApi(projectId, accessToken) {
  return async (path, options = {}) => {
    const response = await fetch(`${API}/${path}`, {
      method: options.method || 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${accessToken}`,
        'x-goog-user-project': projectId,
        ...(options.body ? { 'content-type': 'application/json' } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    })
    if (options.allowNotFound && response.status === 404) return null
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        `Firebase Rules API ${options.method || 'GET'} ${path} failed ` +
          `(HTTP ${response.status}): ${JSON.stringify(payload)}`
      )
    }
    return payload
  }
}
