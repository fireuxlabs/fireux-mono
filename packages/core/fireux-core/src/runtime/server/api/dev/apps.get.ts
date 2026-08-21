// Concurrent edit — 2026-07-20 16:15 CEST — Repo Efficiency Pass 1 of 6: move raw App collection inspection behind an authenticated dev boundary.

import { FieldPath } from 'firebase-admin/firestore'
import { defineEventHandler, setHeader } from 'h3'
import { requireDevDeveloper } from '../../utils/auth/developer'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'

const MAX_DEV_APPS = 250

export default defineEventHandler(async (event) => {
  await requireDevDeveloper(event)
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')

  const snapshot = await getRuntimeFirestore()
    .collection('apps')
    .orderBy(FieldPath.documentId())
    .limit(MAX_DEV_APPS + 1)
    .get()
  const visible = snapshot.docs.slice(0, MAX_DEV_APPS)

  return {
    ok: true,
    items: visible.map((document) => ({
      ...document.data(),
      id: document.id,
    })),
    count: visible.length,
    truncated: snapshot.docs.length > MAX_DEV_APPS,
  }
})
