import { doc, getDoc } from 'firebase/firestore'
import { AppStorage } from '../../../../models/core/app.model'
import { useFirestore } from '../../firestore/vuefire'
import { normalizeConsoleString as normalizeString } from './useConsole'

export type ConsoleAuthorityFamily =
  | 'kitchens'
  | 'suppliers'
  | 'portfolios'
  | 'properties'
  | 'projects'

export type ConsoleAuthorityOperation = 'read' | 'write'

export type AssertCanOperateTargetOptions = {
  family: ConsoleAuthorityFamily
  targetId: string
  uid: string
  appId?: string
  operation?: ConsoleAuthorityOperation
}

const rootAuthorityFamilies = new Set<ConsoleAuthorityFamily>(['projects'])

export function normalizeConsoleOperatorIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return Array.from(
    new Set(value.map((item) => normalizeString(item)).filter(Boolean))
  )
}

export function targetHasOperator(target: unknown, uid: string): boolean {
  const operatorIds = normalizeConsoleOperatorIds(
    (target as Record<string, unknown> | null | undefined)?.operator_ids
  )
  const normalizedUid = normalizeString(uid)

  return Boolean(normalizedUid && operatorIds.includes(normalizedUid))
}

export function targetHasTeam(target: unknown, uid: string): boolean {
  const teamIds = normalizeConsoleOperatorIds(
    (target as Record<string, unknown> | null | undefined)?.team_ids
  )
  const normalizedUid = normalizeString(uid)

  return Boolean(normalizedUid && teamIds.includes(normalizedUid))
}

export function targetHasConsoleAccess(target: unknown, uid: string): boolean {
  const normalizedUid = normalizeString(uid)

  return Boolean(
    normalizedUid &&
    (targetHasTeam(target, normalizedUid) ||
      targetHasOperator(target, normalizedUid))
  )
}

export function useConsoleAuthority() {
  const db = useFirestore()

  async function assertCanOperateTarget({
    family,
    targetId,
    uid,
    appId,
    operation = 'write',
  }: AssertCanOperateTargetOptions): Promise<void> {
    const normalizedUid = normalizeString(uid)
    const normalizedTargetId = normalizeString(targetId)
    const normalizedAppId = normalizeString(appId)

    if (!normalizedUid) {
      throw new Error(`Console ${operation} denied: missing user id.`)
    }
    if (!normalizedTargetId) {
      throw new Error(`Console ${operation} denied: missing target id.`)
    }

    const targetRef = rootAuthorityFamilies.has(family)
      ? doc(db, family, normalizedTargetId)
      : (() => {
          if (!normalizedAppId) {
            throw new Error(
              `Console ${operation} denied: missing app id for ${family}.`
            )
          }
          return doc(db, AppStorage.collection, normalizedAppId, family, normalizedTargetId)
        })()

    const snapshot = await getDoc(targetRef)
    if (!snapshot.exists()) {
      throw new Error(
        `Console ${operation} denied: authority target does not exist.`
      )
    }

    if (!targetHasOperator(snapshot.data(), normalizedUid)) {
      throw new Error(`Console ${operation} denied: user is not an operator.`)
    }
  }

  return {
    assertCanOperateTarget,
  }
}
