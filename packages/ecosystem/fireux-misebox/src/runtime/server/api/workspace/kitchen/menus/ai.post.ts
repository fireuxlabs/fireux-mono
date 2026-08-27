import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  extractFireuxAgentTip, fireuxAgentTipInstruction, } from 'fireux-ai/runtime/models/agents/agent-tip'
import { UserContextStorage } from 'fireux-core/runtime/user/models/user-context.model'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { requireKitchenWriter } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { saveKitchenMenuSummaryContext } from 'fireux-kitchens/runtime/menu/server/ai/kitchen-context'
import { writeKitchenMenuAgentUsage } from 'fireux-kitchens/runtime/menu/server/ai/agent-usage'
import { readKitchenMenuSections } from 'fireux-kitchens/runtime/menu/server/manifest/sections'
import { readKitchenMenusConfig } from 'fireux-kitchens/runtime/kitchen/utils/kitchen-readers'

const PROMPT_MAX_LENGTH = 2_000
const MAX_MENUS = 12
const MAX_ITEMS = 240

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function readableAnswer(value: unknown) {
  const answer = text(value)
  if (!answer) return ''
  const candidate = answer
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = record(JSON.parse(candidate))
    const summary = record(parsed.summary)
    const sections = Array.isArray(summary.sections)
      ? summary.sections.map(record)
      : []
    if (!sections.length) return answer

    const kitchen = text(summary.kitchen) || 'This Kitchen'
    const menu = text(summary.menu) || 'the selected Menu'
    const sectionRows = sections
      .map((section) => ({
        label: text(section.label),
        count: Number(section.number_of_items),
      }))
      .filter((section) => section.label && Number.isFinite(section.count))
    if (!sectionRows.length) return answer
    const itemCount = sectionRows.reduce(
      (total, section) => total + section.count,
      0
    )
    const breakdown = sectionRows
      .map((section) => `${section.label} (${section.count})`)
      .join(', ')

    return `${kitchen}'s ${menu} contains ${sectionRows.length} sections and ${itemCount} Menu items. The sections are: ${breakdown}.`
  } catch {
    return answer
  }
}

function isMenuSummaryRequest(prompt: string) {
  return /^summari[sz]e\s+(?:(?:these|my|the)\s+)?menus?(?:\s+for\s+me)?[.!?]*$/i.test(
    prompt
  )
}

function menuManifest(menus: Awaited<ReturnType<typeof readMenus>>) {
  return menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    status: menu.status,
    section_count: menu.sections.length,
    item_count: menu.sections.reduce(
      (total, section) => total + section.items.length,
      0
    ),
    sections: menu.sections.map((section) => ({
      label: section.label,
      item_count: section.items.length,
    })),
  }))
}

function readPrompt(value: unknown) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'A Menu question is required.',
    })
  }
  const prompt = value.trim()
  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A Menu question is required.',
    })
  }
  if (prompt.length > PROMPT_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Menu questions must not exceed ${PROMPT_MAX_LENGTH} characters.`,
    })
  }
  return prompt
}

async function readUserContext(uid: string) {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection('users')
    .doc(uid)
    .collection(UserContextStorage.collection)
    .doc(UserContextStorage.document)
    .get()

  return snapshot.exists
    ? readRecordString(snapshot.data() || {}, 'context')
    : ''
}

async function readMenus(
  access: Awaited<ReturnType<typeof requireKitchenWriter>>,
  input: { appId: string; kitchenId: string }
) {
  const snapshot = await access.db
    .collection(`kitchens/${input.kitchenId}/menus`)
    .limit(MAX_MENUS)
    .get()
  let remainingItems = MAX_ITEMS

  return Promise.all(
    snapshot.docs.map(async (document) => {
      const data = document.data() || {}
      const sections = await readKitchenMenuSections(access.db, {
        ...input,
        menuId: document.id,
      })
      const boundedSections = sections.map((section) => {
        const items = section.items.slice(0, remainingItems)
        remainingItems = Math.max(0, remainingItems - items.length)
        return {
          label: section.label,
          description: section.description,
          items: items.map((item) => ({
            name: item.name,
            description: item.description,
            kind: item.item_kind,
            price: item.price,
            has_image: Boolean(item.image_url),
            price_options: item.priceOptions,
          })),
        }
      })

      return {
        id: document.id,
        name: readRecordString(data, 'name') || document.id,
        description: readRecordString(data, 'description'),
        status: readRecordString(data, 'status'),
        sections: boundedSections,
      }
    })
  )
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as Record<string, unknown> | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const prompt = readPrompt(body?.prompt)
  const access = await requireKitchenWriter(event, { appId, kitchenId })
  const [userContext, menus] = await Promise.all([
    readUserContext(access.uid),
    readMenus(access, { appId, kitchenId }),
  ])
  const menuContext = readKitchenMenusConfig(access.rootKitchen).context
  const kitchenIdentity = record(access.rootKitchen.identity)
  const kitchenName =
    readRecordString(access.rootKitchen, 'name') ||
    readRecordString(kitchenIdentity, 'display_name') ||
    kitchenId

  const ai = useFireuxAi(event)
  const summaryRequest = isMenuSummaryRequest(prompt)
  const response = await ai.generateText({
    appId,
    task: 'summarise_text',
    timeoutMs: 60_000,
    input: {
      question: prompt,
      kitchen: { id: kitchenId, name: kitchenName },
      menu_manifest: menuManifest(menus),
      menus,
    },
    context: {
      agent: 'MiseboxAiMenu',
      user_context: userContext || undefined,
      menu_context: menuContext || undefined,
      instruction: `Act as MiseboxAiMenu, an advisory Menu specialist for the selected Kitchen. Answer the operator question using only the supplied authorized Menu records, exact menu_manifest facts, and confirmed context. The menu_manifest counts are authoritative: copy them exactly and never recount or alter them. Treat context as operator knowledge, not measured evidence. State when the records do not support a claim. Never claim that you changed or published data. If asked to make a change, explain the proposed change and ask for approval. Be concise, concrete, and use the Menu and Dish names from the records. Return conversational plain text for a restaurant operator. Never return JSON, a schema, code fences, or internal field names. ${fireuxAgentTipInstruction}`,
    },
  })

  const result = extractFireuxAgentTip(response.text, {
    agentId: 'MenuAI',
    parentId: 'KitchenAI',
  })
  const answer = readableAnswer(result.answer)
  if (!response.ok || !answer) {
    throw createError({
      statusCode: response.disabled ? 503 : 502,
      statusMessage: response.reason || 'Misebox AI could not answer.',
    })
  }

  const usage = await writeKitchenMenuAgentUsage({
    appId,
    kitchenId,
    actorId: access.uid,
    agent: 'MiseboxAiMenu',
    task: summaryRequest ? 'summarise_menus' : 'answer_menu_question',
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    tip: result.tip,
  })
  if (summaryRequest) {
    await saveKitchenMenuSummaryContext(event, { kitchenId, summary: answer })
  }

  return {
    ok: true as const,
    answer,
    scope: {
      userContext: Boolean(userContext),
      menuContext: Boolean(menuContext) || summaryRequest,
      menuCount: menus.length,
      source:
        response.execution === 'simulator'
          ? ('simulator' as const)
          : response.execution === 'codex'
            ? ('codex' as const)
            : ('ai' as const),
      contextSaved: summaryRequest,
      tipRecorded: Boolean(result.tip),
      usage: {
        amount: usage.amount_label,
        currency: usage.currency,
      },
    },
  }
})
