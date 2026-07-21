// @fireux-script
// last_used: 2026-07-21
// usage_note: shared explicit Firebase Admin credential resolution for operational scripts.
// Concurrent edit — 2026-07-21 14:13 CEST — Werkbox Firebase hardening: resolve application-default credentials for the read-only canonical migration plan.
// Concurrent edit — 2026-07-20 11:26 CEST — Directory Live Provisioning Pass: record live reconciliation credential use.

import path from 'node:path'
import process from 'node:process'
import { readFile } from 'node:fs/promises'
import { applicationDefault, cert } from 'firebase-admin/app'

const text = (value) => String(value ?? '').trim()

export function firebaseCredentialScope(value) {
  return text(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
}

const projectIdFrom = (value) =>
  text(value?.project_id || value?.projectId)

const credentialResult = (credential, options = {}) => ({
  credential,
  projectId: text(options.projectId),
  source: text(options.source) || 'unknown',
})

export async function resolveEcosystemFirebaseTarget(ecosystem, options = {}) {
  const key = text(ecosystem)
  if (!key) return { ecosystemId: '', projectId: '' }

  const packageName = key.startsWith('fireux-') ? key : `fireux-${key}`
  const configPath = path.join(
    text(options.repoRoot) || process.cwd(),
    'packages',
    'ecosystem',
    packageName,
    'src',
    'config',
    'firebase',
    'ecosystem.config.ts'
  )

  try {
    const source = await readFile(configPath, 'utf8')
    return {
      ecosystemId: (
        source.match(/\bid\s*:\s*'([^']+)'/)?.[1] ||
        source.match(/\bid\s*:\s*"([^"]+)"/)?.[1] ||
        packageName
      ).trim(),
      projectId: (
        source.match(/\bprojectId\s*:\s*'([^']+)'/)?.[1] ||
        source.match(/\bprojectId\s*:\s*"([^"]+)"/)?.[1] ||
        ''
      ).trim(),
    }
  } catch {
    return { ecosystemId: packageName, projectId: '' }
  }
}

async function credentialFromFile(filePath, source, projectIdHint) {
  const resolvedPath = path.resolve(text(filePath))
  const raw = await readFile(resolvedPath, 'utf8')
  let value

  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error(`${source} does not contain valid JSON.`)
  }

  return credentialResult(cert(value), {
    projectId: text(projectIdHint) || projectIdFrom(value),
    source,
  })
}

function credentialFromJson(raw, source, projectIdHint) {
  let value

  try {
    value = JSON.parse(text(raw))
  } catch {
    throw new Error(`${source} is set but does not contain valid JSON.`)
  }

  return credentialResult(cert(value), {
    projectId: text(projectIdHint) || projectIdFrom(value),
    source,
  })
}

function credentialFromSplitEnv(keys, source, projectIdHint) {
  const projectId = text(process.env[keys.projectId]) || text(projectIdHint)
  const clientEmail = text(process.env[keys.clientEmail])
  const rawPrivateKey = text(process.env[keys.privateKey])

  if (!clientEmail && !rawPrivateKey) return null
  if (!projectId || !clientEmail || !rawPrivateKey) {
    throw new Error(
      `${source} is partially configured; project id, client email, and private key are required together.`
    )
  }

  return credentialResult(
    cert({
      projectId,
      clientEmail,
      privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
    }),
    { projectId, source }
  )
}

export async function resolveFirebaseAdminCredential(options = {}) {
  const args = options.args || {}
  const projectIdHint = text(options.projectId)
  const scope = firebaseCredentialScope(options.scope)
  const scopedProjectId = scope
    ? text(process.env[`FIREBASE_PROJECT_ID__${scope}`])
    : ''
  const effectiveProjectId = projectIdHint || scopedProjectId

  if (text(args['service-account'])) {
    return credentialFromFile(
      args['service-account'],
      '--service-account',
      effectiveProjectId
    )
  }

  if (scope) {
    const scopedFileKey = `FIREBASE_SERVICE_ACCOUNT_FILE__${scope}`
    const scopedJsonKey = `FIREBASE_SERVICE_ACCOUNT__${scope}`

    if (text(process.env[scopedFileKey])) {
      return credentialFromFile(
        process.env[scopedFileKey],
        scopedFileKey,
        effectiveProjectId
      )
    }

    if (text(process.env[scopedJsonKey])) {
      return credentialFromJson(
        process.env[scopedJsonKey],
        scopedJsonKey,
        effectiveProjectId
      )
    }
  }

  if (text(process.env.FIREBASE_SERVICE_ACCOUNT_FILE)) {
    return credentialFromFile(
      process.env.FIREBASE_SERVICE_ACCOUNT_FILE,
      'FIREBASE_SERVICE_ACCOUNT_FILE',
      effectiveProjectId
    )
  }

  if (text(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return credentialResult(applicationDefault(), {
      projectId:
        effectiveProjectId ||
        text(process.env.GOOGLE_CLOUD_PROJECT) ||
        text(process.env.GCLOUD_PROJECT) ||
        text(process.env.FIREBASE_PROJECT_ID),
      source: 'GOOGLE_APPLICATION_CREDENTIALS',
    })
  }

  if (scope) {
    const scopedSplit = credentialFromSplitEnv(
      {
        projectId: `FIREBASE_PROJECT_ID__${scope}`,
        clientEmail: `FIREBASE_CLIENT_EMAIL__${scope}`,
        privateKey: `FIREBASE_PRIVATE_KEY__${scope}`,
      },
      `FIREBASE_*__${scope}`,
      effectiveProjectId
    )
    if (scopedSplit) return scopedSplit
  }

  if (text(process.env.FIREBASE_SERVICE_ACCOUNT)) {
    return credentialFromJson(
      process.env.FIREBASE_SERVICE_ACCOUNT,
      'FIREBASE_SERVICE_ACCOUNT',
      effectiveProjectId
    )
  }

  const split = credentialFromSplitEnv(
    {
      projectId: 'FIREBASE_PROJECT_ID',
      clientEmail: 'FIREBASE_CLIENT_EMAIL',
      privateKey: 'FIREBASE_PRIVATE_KEY',
    },
    'FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY',
    effectiveProjectId
  )
  if (split) return split

  return credentialResult(applicationDefault(), {
    projectId:
      effectiveProjectId ||
      text(process.env.GOOGLE_CLOUD_PROJECT) ||
      text(process.env.GCLOUD_PROJECT) ||
      text(process.env.FIREBASE_PROJECT_ID),
    source: 'application-default',
  })
}

export function firebaseAdminCredentialHelp() {
  return [
    '--service-account <path>',
    'FIREBASE_SERVICE_ACCOUNT_FILE__<ECOSYSTEM_OR_PROJECT> or FIREBASE_SERVICE_ACCOUNT__<ECOSYSTEM_OR_PROJECT>',
    'FIREBASE_SERVICE_ACCOUNT_FILE',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'FIREBASE_PROJECT_ID__<SCOPE> + FIREBASE_CLIENT_EMAIL__<SCOPE> + FIREBASE_PRIVATE_KEY__<SCOPE>',
    'FIREBASE_SERVICE_ACCOUNT (JSON)',
    'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY',
    'Application Default Credentials',
  ]
}
