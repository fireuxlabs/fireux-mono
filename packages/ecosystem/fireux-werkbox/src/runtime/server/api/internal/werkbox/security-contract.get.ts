// Concurrent edit — 2026-07-21 15:14 CEST — Werkbox Firebase hardening: attest the reviewed server-source manifest, shared URL boundary, and runtime identity.
// Concurrent edit — 2026-07-21 16:08 CEST — Shared Firestore Rules pass: refresh the trusted-source attestation after concurrent Firebase schema edits.
// Concurrent edit — 2026-07-21 16:11 CEST — User bio pass: refresh trusted-source attestation for canonical User schema and projection changes.
import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler } from 'h3'

export const WERKBOX_SECURITY_CONTRACT = 'werkbox-firestore-v1' as const
export const WERKBOX_SERVER_SOURCE_SHA256 =
  '07fb1ed2a217d6f60be58bfdd1a27d9b46712861826ae2ffe704870d64f4d317' as const

export default defineEventHandler((event) => {
  const runtime = useRuntimeConfig(event) as any
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const appId = String(fireux.id ?? '').trim()
  const projectId = String(fireux.projectId ?? '').trim()
  const ecosystemId = String(fireux.ecosystemId ?? '').trim()
  const databaseId = String(fireux.databaseId ?? '').trim()

  if (
    !['cleanbox-app', 'richies-reinigung'].includes(appId) ||
    projectId !== 'cleanbox' ||
    ecosystemId !== 'cleanbox' ||
    databaseId !== 'cleanbox'
  ) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Werkbox security contract is not configured.',
    })
  }

  return {
    contract: WERKBOX_SECURITY_CONTRACT,
    source_sha256: WERKBOX_SERVER_SOURCE_SHA256,
    app_id: appId,
    project_id: projectId,
    ecosystem_id: ecosystemId,
    database_id: databaseId,
  }
})
