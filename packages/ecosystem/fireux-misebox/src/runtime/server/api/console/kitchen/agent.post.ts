import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  extractFireuxAgentTip,
  fireuxAgentTipInstruction,
} from 'fireux-ai/runtime/agents/agent-tip'
import { UserStorage } from 'fireux-core/runtime/models/core/user.model'
import { UserContextStorage } from 'fireux-core/runtime/models/operations/user-context.model'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { requireKitchenWriter } from 'fireux-kitchens/runtime/server/kitchen/operator-access'
import {
  addKitchenTeamMemberTool,
  executeAddKitchenTeamMemberTool,
} from 'fireux-kitchens/runtime/server/kitchen/team/add-member-tool'
import {
  createKitchenMemberInvitationTool,
  executeCreateKitchenMemberInvitationTool,
} from 'fireux-kitchens/runtime/server/kitchen/team/create-member-invitation-tool'
import {
  executeUpdateKitchenMemberPlan,
  updateKitchenMemberTool,
} from 'fireux-kitchens/runtime/server/kitchen/team/update-member-tool'
import { writeKitchenAgentUsage } from 'fireux-kitchens/runtime/server/kitchen/ai/usage'
import { readKitchenMenuSections } from 'fireux-kitchens/runtime/server/menu/manifest/sections'
import { readKitchenMenusConfig } from 'fireux-kitchens/runtime/utils/kitchen-spine'
import {
  pendingTeamTool,
  possibleTeamToolRequest,
  requestsTeamTitleCase,
  selectKitchenTeamTool,
  teamTitleCaseChanges,
  teamToolConfirmation,
  type PendingTeamTool,
} from '../../../utils/kitchen-team-tools'

const PROMPT_MAX_LENGTH = 2_000
const MAX_MENUS = 12
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function readPrompt(value: unknown) {
  const prompt = text(value)
  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A Kitchen question is required.',
    })
  }
  if (prompt.length > PROMPT_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kitchen questions must not exceed ${PROMPT_MAX_LENGTH} characters.`,
    })
  }
  return prompt
}

async function readUserContext(uid: string) {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection(UserStorage.collection)
    .doc(uid)
    .collection(UserContextStorage.collection)
    .doc(UserContextStorage.document)
    .get()

  return snapshot.exists
    ? readRecordString(snapshot.data() || {}, 'context')
    : ''
}

async function resolveInvitationMember(
  access: Awaited<ReturnType<typeof requireKitchenWriter>>,
  input: { appId: string; kitchenId: string; name: string }
) {
  const requestedSlug = normalizeSlug(input.name)
  const snapshot = await access.db
    .collection(`apps/${input.appId}/kitchens/${input.kitchenId}/team`)
    .limit(200)
    .get()
  const matches = snapshot.docs.filter((document) => {
    const data = document.data() || {}
    if (readRecordString(data, 'user_id')) return false
    const name = readRecordString(data, 'name')
    const slug = readRecordString(data, 'slug') || normalizeSlug(name)
    return (
      slug === requestedSlug || name.toLowerCase() === input.name.toLowerCase()
    )
  })
  if (!matches.length) {
    throw createError({
      statusCode: 404,
      statusMessage: `No unclaimed Kitchen member named ${input.name} was found.`,
    })
  }
  if (matches.length > 1) {
    throw createError({
      statusCode: 409,
      statusMessage: `More than one unclaimed Kitchen member matches ${input.name}. Use the Team page to choose one.`,
    })
  }
  const member = matches[0]!
  return {
    memberId: member.id,
    name: readRecordString(member.data(), 'name') || input.name,
  }
}

async function readMenuManifest(
  access: Awaited<ReturnType<typeof requireKitchenWriter>>,
  input: { appId: string; kitchenId: string }
) {
  const snapshot = await access.db
    .collection(`apps/${input.appId}/kitchens/${input.kitchenId}/menus`)
    .limit(MAX_MENUS)
    .get()

  return Promise.all(
    snapshot.docs.map(async (document) => {
      const data = document.data() || {}
      const sections = await readKitchenMenuSections(access.db, {
        ...input,
        menuId: document.id,
      })
      return {
        id: document.id,
        name: readRecordString(data, 'name') || document.id,
        status: readRecordString(data, 'status'),
        section_count: sections.length,
        item_count: sections.reduce(
          (total, section) => total + section.items.length,
          0
        ),
        sections: sections.map((section) => ({
          label: section.label,
          item_count: section.items.length,
        })),
      }
    })
  )
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as Record<string, unknown> | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const prompt = readPrompt(body?.prompt)
  const operation = text(body?.operation)
  const access = await requireKitchenWriter(event, { appId, kitchenId })
  const pending = pendingTeamTool(body?.pendingTool)
  if (pending) {
    const decision = teamToolConfirmation(prompt)
    if (decision === 'cancelled') {
      return {
        ok: true as const,
        answer:
          pending.id === updateKitchenMemberTool.id
            ? 'Okay, I won’t update the Team names.'
            : pending.id === createKitchenMemberInvitationTool.id
              ? `Okay, I won’t create an invitation for ${pending.name}.`
              : `Okay, I won’t add ${pending.name}.`,
      }
    }
    if (decision !== 'confirmed') {
      return {
        ok: true as const,
        answer:
          pending.id === updateKitchenMemberTool.id
            ? `Please confirm these name changes: ${pending.changes.map((change) => `${change.previousName} → ${change.name}`).join(', ')}.`
            : pending.id === createKitchenMemberInvitationTool.id
              ? `Please confirm: create a one-use invitation link for ${pending.name}?`
              : `Please confirm: add ${pending.name} to this Kitchen team?`,
        pendingTool: pending,
      }
    }
    if (pending.id === updateKitchenMemberTool.id) {
      const updated = await executeUpdateKitchenMemberPlan(event, {
        kitchenId,
        changes: pending.changes.map(({ memberId, name }) => ({
          memberId,
          name,
        })),
      })
      return {
        ok: true as const,
        answer: `${updated.changes.length} Team ${updated.changes.length === 1 ? 'name has' : 'names have'} been updated.`,
        tool: { id: pending.id, result: updated },
      }
    }
    if (pending.id === createKitchenMemberInvitationTool.id) {
      const invitation = await executeCreateKitchenMemberInvitationTool(event, {
        kitchenId,
        memberId: pending.memberId,
      })
      return {
        ok: true as const,
        answer: `A one-use invitation for ${invitation.memberName} is ready and expires in seven days.`,
        tool: { id: pending.id, result: invitation },
        resultAction: {
          kind: createKitchenMemberInvitationTool.result.primaryAction,
          label: createKitchenMemberInvitationTool.result.label,
          value: `/kitchen/member-invitation/${encodeURIComponent(invitation.token)}`,
        },
      }
    }
    const created = await executeAddKitchenTeamMemberTool(event, {
      kitchenId,
      name: pending.name,
    })
    return {
      ok: true as const,
      answer: `${created.name} has been added to this Kitchen team.`,
      tool: { id: pending.id, result: created },
      createdObject: {
        name: created.name,
        kind: 'Team member',
        to: `/console/kitchen/team#${created.slug}`,
      },
    }
  }

  const ai = useFireuxAi(event)
  if (requestsTeamTitleCase(prompt)) {
    const members = await access.db
      .collection(`apps/${appId}/kitchens/${kitchenId}/team`)
      .limit(200)
      .get()
    const changes = teamTitleCaseChanges(members.docs)
    if (!changes.length) {
      return {
        ok: true as const,
        answer: 'All Team member names already use title case.',
      }
    }
    const proposal: PendingTeamTool = {
      id: updateKitchenMemberTool.id,
      name: 'Team member names',
      changes,
    }
    return {
      ok: true as const,
      answer: `TeamAI can make these changes: ${changes.map((change) => `${change.previousName} → ${change.name}`).join(', ')}. Shall I continue?`,
      pendingTool: proposal,
    }
  }
  if (possibleTeamToolRequest(prompt)) {
    const selection = await selectKitchenTeamTool(ai, appId, prompt)
    const name = text(selection.data?.name).replace(/\s+/g, ' ')
    if (
      selection.ok &&
      selection.data?.action === 'create_member_invitation' &&
      selection.data.agent === 'TeamAI' &&
      name &&
      name.length <= 120
    ) {
      const member = await resolveInvitationMember(access, {
        appId,
        kitchenId,
        name,
      })
      const proposal: PendingTeamTool = {
        id: createKitchenMemberInvitationTool.id,
        memberId: member.memberId,
        name: member.name,
      }
      return {
        ok: true as const,
        answer: `TeamAI found ${member.name}. It can create a one-use invitation link that expires in seven days. Shall I continue?`,
        pendingTool: proposal,
      }
    }
    if (
      selection.ok &&
      selection.data?.action === 'add_team_member' &&
      selection.data.agent === 'TeamAI' &&
      name &&
      name.length <= 120
    ) {
      const proposal: PendingTeamTool = {
        id: addKitchenTeamMemberTool.id,
        name,
      }
      return {
        ok: true as const,
        answer: `KitchenAI has delegated this to TeamAI. TeamAI can use Add team member to add ${name}. Shall I continue?`,
        pendingTool: proposal,
      }
    }
  }

  if (operation === 'team') {
    return {
      ok: true as const,
      answer:
        'No Team command matched. Try “Add a member named Paul” or “Create an invitation for Daisy”.',
    }
  }

  const [userContext, menuManifest] = await Promise.all([
    readUserContext(access.uid),
    readMenuManifest(access, { appId, kitchenId }),
  ])
  const identity = record(access.rootKitchen.identity)
  const kitchenName = readRecordString(identity, 'name') || kitchenId
  const kitchenContext = readRecordString(
    record(access.appKitchen.console),
    'context'
  )
  const menuContext = readKitchenMenusConfig(access.appKitchen).context
  const response = await ai.generateText({
    appId,
    task: 'summarise_text',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_summary',
      question: prompt,
      kitchen: {
        id: kitchenId,
        name: kitchenName,
        tagline: readRecordString(identity, 'tagline'),
        context: kitchenContext || undefined,
      },
      operation_agents: {
        MenuAI: {
          operation: 'Menus',
          authority: 'advisory',
          menu_manifest: menuManifest,
          context: menuContext || undefined,
          instruction:
            'Assess the current Menu shape from exact manifest counts and confirmed Menu context. Identify useful operational observations without inventing sales, popularity, profitability, ingredient, stock, or customer evidence. Do not propose or claim a mutation.',
        },
      },
    },
    context: {
      agent: 'KitchenAI',
      user_context: userContext || undefined,
      kitchen_context: kitchenContext || undefined,
      menu_context: menuContext || undefined,
      instruction: `Act as KitchenAI for the selected Kitchen. Answer using only the supplied authorized Kitchen identity, confirmed context, and named operation-agent scopes. For this summary, consult MenuAI and incorporate its supported operational observations into the final Kitchen summary. Treat saved context as operator knowledge, not measured evidence. State when the records do not support a claim. Do not claim to have changed data. Be concise and conversational. ${fireuxAgentTipInstruction}`,
    },
  })
  const result = extractFireuxAgentTip(response.text, {
    agentId: 'KitchenAI',
    parentId: 'MiseboxAI',
  })
  const answer = text(result.answer)
  if (!response.ok || !answer) {
    throw createError({
      statusCode: response.disabled ? 503 : 502,
      statusMessage: response.reason || 'KitchenAI could not answer.',
    })
  }

  const usage = await writeKitchenAgentUsage({
    appId,
    kitchenId,
    actorId: access.uid,
    agent: 'KitchenAI',
    task: 'answer_kitchen_question',
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    tip: result.tip,
  })

  return {
    ok: true as const,
    answer,
    scope: {
      source:
        response.execution === 'simulator'
          ? ('simulator' as const)
          : response.execution === 'codex'
            ? ('codex' as const)
            : ('ai' as const),
      kitchenName,
      userContext: Boolean(userContext),
      kitchenContext: Boolean(kitchenContext),
      menuContext: Boolean(menuContext),
      menuCount: menuManifest.length,
      delegates: ['MenuAI'] as const,
      tipRecorded: Boolean(result.tip),
      usage: { amount: usage.amount_label, currency: usage.currency },
    },
  }
})
