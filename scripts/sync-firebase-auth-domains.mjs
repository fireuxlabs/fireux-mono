#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-26
// usage_note: preserve and append explicitly declared Firebase Auth domains before an App deploy.

import process from 'node:process'

import { parseArgs } from './_lib/args.mjs'
import { parseFirebaseAuthDomains } from './_lib/firebase-auth-domains.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const projectId = String(args.project || '').trim()
const domains = parseFirebaseAuthDomains(args.domains)

if (args.help || args.h) {
  printUsage(0)
}

if (!projectId || !domains.length) {
  printUsage(2)
}

const auth = await resolveFirebaseAdminCredential({
  args,
  scope: projectId,
  projectId,
})
const access = await auth.credential.getAccessToken()
const accessToken = String(access?.access_token || '').trim()
if (!accessToken) {
  throw new Error('Firebase credential returned no access token.')
}

const endpoint =
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`
const headers = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'x-goog-user-project': projectId,
}

const before = await readConfig()
const previous = Array.isArray(before.authorizedDomains)
  ? before.authorizedDomains.map(domain => String(domain).trim()).filter(Boolean)
  : []
const next = [...new Set([...previous, ...domains])].sort()
const added = next.filter(domain => !previous.includes(domain))

if (added.length) {
  const response = await fetch(`${endpoint}?updateMask=authorizedDomains`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ authorizedDomains: next }),
  })
  if (!response.ok) {
    throw new Error(
      `Firebase Auth domain update failed: ${response.status} ${await response.text()}`
    )
  }
  await response.json()
}

const after = await readConfig()
const current = Array.isArray(after.authorizedDomains)
  ? after.authorizedDomains
  : []
const missing = domains.filter(domain => !current.includes(domain))
if (missing.length) {
  throw new Error(
    `Firebase Auth domain verification failed for: ${missing.join(', ')}.`
  )
}

console.log(
  JSON.stringify(
    {
      projectId,
      credentialSource: auth.source,
      requested: domains,
      added,
      previousCount: previous.length,
      currentCount: current.length,
      verified: true,
    },
    null,
    2
  )
)

async function readConfig() {
  const response = await fetch(endpoint, { headers })
  if (!response.ok) {
    throw new Error(
      `Firebase Auth config read failed: ${response.status} ${await response.text()}`
    )
  }
  return response.json()
}

function printUsage(exitCode) {
  const stream = exitCode === 0 ? process.stdout : process.stderr
  stream.write(
    [
      'Usage:',
      '  node scripts/sync-firebase-auth-domains.mjs --project <firebase-project> --domains <hostname[,hostname]>',
      '',
      'Adds missing hostnames without removing existing Firebase Auth authorized domains.',
      ...firebaseAdminCredentialHelp().map(line => `  - ${line}`),
      '',
    ].join('\n')
  )
  process.exit(exitCode)
}
