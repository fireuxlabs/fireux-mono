import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import type { FireUXConfig } from '../../composables/config/FireUXConfig'
import type { AppWorkspaceFamily } from '../../models/app.model.ts'
import { FIRESTORE_MUTATION_TARGETS } from '../../../utils/firestore-mutations/targets'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'

type EnsureRuntimeAppMetaInput = {
  actorUid: string
  appDatabaseId: string
  config: Readonly<FireUXConfig>
}

export type EnsureRuntimeAppMetaResult = {
  created: boolean
  updated: boolean
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function media(value: unknown) {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  return {
    thumbnail_url: text(source.thumbnail_url),
    logo_url: text(source.logo_url),
    wordmark_light_url: text(source.wordmark_light_url),
    wordmark_dark_url: text(source.wordmark_dark_url),
    cover_url: text(source.cover_url),
  }
}

function workspaceFamilies(config: Readonly<FireUXConfig>): AppWorkspaceFamily[] {
  return [...new Set(config.workspaces.map(text).filter(Boolean))].sort()
}

function projectionPayload(
  app: DocumentData,
  input: EnsureRuntimeAppMetaInput
): DocumentData {
  const { config } = input
  const projectId = text(app.project_id)
  const ecosystemId = text(app.ecosystem_id)
  const role = text(app.role)
  const status = text(app.status)
  const name = text(app.name)
  const shortName = text(app.short_name)
  const websiteUrl = text(config.siteUrl)
  if (
    projectId !== config.projectId ||
    ecosystemId !== (config.ecosystemId || '') ||
    role !== config.role
  ) {
    throw new Error(
      'Canonical App identity does not match runtime configuration.'
    )
  }
  if (!status || !name || !shortName || !websiteUrl) {
    throw new Error(
      'Canonical App status, name, short_name, and runtime siteUrl are required for AppMeta.'
    )
  }

  return {
    project_id: projectId,
    ...(ecosystemId ? { ecosystem_id: ecosystemId } : {}),
    role,
    status,
    name,
    short_name: shortName,
    description: text(app.description),
    media: media(app.media),
    database_id: input.appDatabaseId,
    website_url: websiteUrl,
    workspace_families: workspaceFamilies(config),
    updated: {
      at: FieldValue.serverTimestamp(),
      by: input.actorUid,
    },
  }
}

export async function ensureRuntimeAppMeta(
  input: EnsureRuntimeAppMetaInput
): Promise<EnsureRuntimeAppMetaResult> {
  if (!text(input.appDatabaseId) || input.appDatabaseId === '(default)') {
    throw new Error('A named canonical App database is required for AppMeta.')
  }
  const appSnapshot = await getRuntimeFirestore(input.appDatabaseId)
    .collection('apps')
    .doc(input.config.appId)
    .get()
  if (!appSnapshot.exists) {
    throw new Error('Canonical App must exist before its AppMeta projection.')
  }
  const payload = projectionPayload(appSnapshot.data() ?? {}, input)
  const target = FIRESTORE_MUTATION_TARGETS.runtimeAppMeta

  return runGuardedServerTransaction(target.database, async (mutations) => {
    const current = await mutations.read(target, input.config.appId)
    if (!current.exists) {
      mutations.create(target, input.config.appId, payload)
      return { created: true, updated: false }
    }
    mutations.update(target, input.config.appId, payload)
    return { created: false, updated: true }
  })
}
