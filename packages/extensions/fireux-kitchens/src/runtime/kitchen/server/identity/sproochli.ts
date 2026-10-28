import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenIntegrationsTarget } from '../mutation-targets'
import {
  readSproochliAttachmentConfig,
  type SproochliDefaultLanguage,
} from 'fireux-sproochli/runtime/sproochli'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority.ts'

const allowedDefaultLanguages = [
  'mixed',
  'en',
  'de',
] as const satisfies readonly SproochliDefaultLanguage[]
const allowedDefaultLanguageSet = new Set<SproochliDefaultLanguage>(
  allowedDefaultLanguages
)
type AllowedDefaultLanguage = (typeof allowedDefaultLanguages)[number]

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Kitchen Sproochli request must be an object.')
  }
  const source = value as Record<string, unknown>
  const allowed = new Set(['kitchen_id', 'enabled', 'default_language'])
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported) {
    badRequest(`Kitchen Sproochli contains unsupported field: ${unsupported}.`)
  }
  if (typeof source.enabled !== 'boolean') {
    badRequest('Kitchen Sproochli enabled must be a boolean.')
  }

  const defaultLanguage = String(source.default_language ?? '')
    .trim()
    .toLowerCase() as SproochliDefaultLanguage
  if (source.enabled && !allowedDefaultLanguageSet.has(defaultLanguage)) {
    badRequest('Kitchen Sproochli default language must be mixed, en, or de.')
  }

  return {
    kitchenId: requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id'),
    enabled: source.enabled,
    defaultLanguage: source.enabled
      ? (defaultLanguage as AllowedDefaultLanguage)
      : undefined,
  }
}

export async function updateKitchenSproochli(event: H3Event, input: unknown) {
  const requested = request(input)
  const actor = await readKitchenMutationActor(event)

  const sproochli = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      await requireKitchenMutationAuthority(
        mutations,
        actor,
        requested.kitchenId
      )
      const target = serverKitchenIntegrationsTarget(requested.kitchenId)
      const attachment = await mutations.read(target, 'sproochli')
      const current = attachment.exists
        ? readSproochliAttachmentConfig(attachment.data)
        : readSproochliAttachmentConfig(undefined)
      const next = readSproochliAttachmentConfig({
        ...current,
        enabled: requested.enabled,
        ...(requested.defaultLanguage
          ? { default_language: requested.defaultLanguage }
          : { default_language: undefined }),
      })

      if (attachment.exists) mutations.update(target, 'sproochli', next)
      else mutations.create(target, 'sproochli', next)
      return next
    }
  )

  return {
    ok: true as const,
    app_id: actor.runtimeAppId,
    kitchen_id: requested.kitchenId,
    sproochli,
  }
}
