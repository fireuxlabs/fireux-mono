#!/usr/bin/env node

import { createSign } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'la-tap-berne'
const KITCHEN_ID = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const UID = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'
const SCOPE = 'https://www.googleapis.com/auth/datastore'

const base64url = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')

const json64 = (value) => base64url(JSON.stringify(value))

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: serviceAccount.client_email,
    scope: SCOPE,
    aud: serviceAccount.token_uri,
    iat: now,
    exp: now + 3600,
  }
  const unsigned = `${json64(header)}.${json64(claims)}`
  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(serviceAccount.private_key)
  const assertion = `${unsigned}.${base64url(signature)}`
  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${await response.text()}`)
  }

  const token = await response.json()
  return token.access_token
}

const toStrings = (field) =>
  field?.arrayValue?.values
    ?.map((entry) => String(entry?.stringValue ?? '').trim())
    .filter(Boolean) ?? []

const serviceAccount = JSON.parse(await readFile(SERVICE_ACCOUNT, 'utf8'))
const accessToken = await getAccessToken(serviceAccount)
const docUrl =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
  `/databases/${DATABASE_ID}/documents/apps/${APP_ID}/kitchens/${KITCHEN_ID}`

const readResponse = await fetch(docUrl, {
  headers: { authorization: `Bearer ${accessToken}` },
})

if (!readResponse.ok) {
  throw new Error(`Read failed: ${readResponse.status} ${await readResponse.text()}`)
}

const doc = await readResponse.json()
const currentOperatorIds = toStrings(doc.fields?.operator_ids)
const nextOperatorIds = Array.from(new Set([...currentOperatorIds, UID])).sort()

const patchResponse = await fetch(`${docUrl}?updateMask.fieldPaths=operator_ids`, {
  method: 'PATCH',
  headers: {
    authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    fields: {
      operator_ids: {
        arrayValue: {
          values: nextOperatorIds.map((id) => ({ stringValue: id })),
        },
      },
    },
  }),
})

if (!patchResponse.ok) {
  throw new Error(`Patch failed: ${patchResponse.status} ${await patchResponse.text()}`)
}

console.log(
  JSON.stringify(
    {
      path: `apps/${APP_ID}/kitchens/${KITCHEN_ID}`,
      before: currentOperatorIds,
      after: nextOperatorIds,
    },
    null,
    2
  )
)
