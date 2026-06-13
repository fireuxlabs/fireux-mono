import { normalizeString, uniqueStrings } from '../../../../utils/string'

const targetField = (target: unknown, key: 'team_ids' | 'operator_ids') =>
  (target as Record<string, unknown> | null | undefined)?.[key]

export function targetTeamIds(target: unknown): string[] {
  return uniqueStrings(targetField(target, 'team_ids'))
}

export function targetOperatorIds(target: unknown): string[] {
  return uniqueStrings(targetField(target, 'operator_ids'))
}

export function targetAccessIds(target: unknown): string[] {
  return uniqueStrings([...targetTeamIds(target), ...targetOperatorIds(target)])
}

export function targetHasOperator(target: unknown, uid: string): boolean {
  const normalizedUid = normalizeString(uid)

  return Boolean(
    normalizedUid && targetOperatorIds(target).includes(normalizedUid)
  )
}

export function targetHasTeam(target: unknown, uid: string): boolean {
  const normalizedUid = normalizeString(uid)

  return Boolean(normalizedUid && targetTeamIds(target).includes(normalizedUid))
}

export function targetHasConsoleAccess(target: unknown, uid: string): boolean {
  const normalizedUid = normalizeString(uid)

  return Boolean(
    normalizedUid &&
      (targetHasTeam(target, normalizedUid) ||
        targetHasOperator(target, normalizedUid))
  )
}

export function useConsoleAccess() {
  return {
    targetTeamIds,
    targetOperatorIds,
    targetAccessIds,
    targetHasTeam,
    targetHasOperator,
    targetHasConsoleAccess,
  }
}
