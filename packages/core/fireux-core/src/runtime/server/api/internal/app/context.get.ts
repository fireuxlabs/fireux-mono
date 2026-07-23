import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../../models/core/app.model'
import { UserAppStorage } from '../../../../models/core/user.model'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'
import { projectPublicApp } from '../../../utils/public-projection/public-app.dto'
import type {
  CurrentAppContextResponse,
  CurrentAppMembershipDto,
} from '../../../utils/public-projection/public-dto.types'

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

function stringList(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some(entry => typeof entry !== 'string')) {
    conflict(`${label} is malformed.`)
  }
  return [...new Set(value.map(entry => entry.trim()).filter(Boolean))]
}

function membershipDto(
  id: string,
  value: Record<string, unknown>
): CurrentAppMembershipDto {
  const role = value.role
  if (role !== 'admin' && role !== 'user') {
    conflict('Current App membership has an invalid role.')
  }
  if (
    typeof value.is_premium !== 'boolean' ||
    typeof value.console_enabled !== 'boolean'
  ) {
    conflict('Current App membership has invalid capability fields.')
  }
  const rawTargets = value.console_targets
  if (!rawTargets || typeof rawTargets !== 'object' || Array.isArray(rawTargets)) {
    conflict('Current App membership has invalid Console targets.')
  }
  const consoleTargets = Object.fromEntries(
    Object.entries(rawTargets).map(([key, entries]) => [
      key,
      stringList(entries, `Console target ${key}`),
    ])
  )

  return {
    id,
    role,
    is_premium: value.is_premium,
    console_enabled: value.console_enabled,
    profiles: stringList(value.profiles, 'Current App profiles'),
    console_targets: consoleTargets,
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId } = useFireUXConfig()
  const appRef = getRuntimeFirestore()
    .collection(AppStorage.collection)
    .doc(appId)
  const membershipRef = appRef
    .collection(UserAppStorage.collection)
    .doc(uid)
  const [appSnapshot, membershipSnapshot] = await getRuntimeFirestore().getAll(
    appRef,
    membershipRef
  )

  const app = appSnapshot.exists
    ? projectPublicApp(
        (appSnapshot.data() || {}) as Record<string, unknown>,
        { id: appSnapshot.id }
      )
    : null
  if (appSnapshot.exists && !app) {
    conflict('Current App has an invalid canonical shape.')
  }

  const membership = membershipSnapshot.exists
    ? membershipDto(
        membershipSnapshot.id,
        (membershipSnapshot.data() || {}) as Record<string, unknown>
      )
    : null

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const response: CurrentAppContextResponse = {
    ok: true,
    appId,
    app,
    membership,
  }
  return response
})
