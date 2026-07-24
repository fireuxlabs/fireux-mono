import { createError, defineEventHandler, readBody } from 'h3'
import { setSproochliToolHeaders } from '../../../utils/sproochliTools'
import { draftSproochliCopyWithAi } from '../../../utils/sproochliCopyAi'
import { normalizeSproochliText } from '../../../utils/sproochliTranslate'

const MAX_GLOSSARY_ENTRIES = 50

function glossary(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, MAX_GLOSSARY_ENTRIES)
      .map(([key, copy]) => [normalizeSproochliText(key), normalizeSproochliText(copy)])
      .filter(([key, copy]) => key && copy)
  )
}

export default defineEventHandler(async (event) => {
  setSproochliToolHeaders(event)
  const body = await readBody(event).catch(() => null) as Record<string, unknown> | null
  const sourceText = normalizeSproochliText(body?.sourceText)
  const profile = body?.profile && typeof body.profile === 'object'
    ? body.profile as Record<string, unknown>
    : {}

  if (!sourceText || sourceText.length > 2_000) {
    throw createError({ statusCode: 400, statusMessage: 'Bounded source copy is required.' })
  }
  if (body?.sourceLanguage !== 'en' || body?.targetLanguage !== 'gsw') {
    throw createError({ statusCode: 400, statusMessage: 'Copy drafting supports en to gsw.' })
  }

  const profileId = normalizeSproochliText(profile.id)
  const locale = normalizeSproochliText(profile.locale)
  const region = normalizeSproochliText(profile.region)
  const style = normalizeSproochliText(profile.style)
  if (!profileId || !locale || !region || !style) {
    throw createError({ statusCode: 400, statusMessage: 'A complete dialect profile is required.' })
  }

  const draft = await draftSproochliCopyWithAi(event, {
    key: normalizeSproochliText(body?.key),
    sourceText,
    profileId,
    locale,
    region,
    style,
    glossary: glossary(profile.glossary),
  })
  if (!draft) {
    throw createError({ statusCode: 502, statusMessage: 'AI copy drafting failed.' })
  }

  return {
    key: normalizeSproochliText(body?.key),
    source_language: 'en',
    source_text: sourceText,
    target_language: 'gsw',
    target_text: draft.text,
    profile_id: profileId,
    status: 'ai_draft',
    provenance: {
      kind: 'ai',
      provider: draft.provider,
      generated_at: new Date().toISOString(),
    },
  }
})
