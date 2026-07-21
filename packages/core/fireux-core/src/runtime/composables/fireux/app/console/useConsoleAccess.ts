// Concurrent edit — 2026-07-21 23:18 CEST — Console family alignment: expose strict complete App-support authority validation.
import { normalizeString, uniqueStrings } from '../../../../utils/string'

type ConsoleTargetAuthorityKey =
  | 'operator_ids'
  | 'team_ids'
  | 'join_requests'

export type ConsoleTargetAuthority = {
  operatorIds: string[]
  teamIds: string[]
  joinRequestIds: string[]
}

const targetField = (target: unknown, key: ConsoleTargetAuthorityKey) =>
  (target as Record<string, unknown> | null | undefined)?.[key]

const strictTargetIds = (value: unknown, max: number): string[] | null => {
  if (!Array.isArray(value) || value.length > max) return null
  if (value.some(item => typeof item !== 'string')) return null

  const ids = value.map(item => normalizeString(item))
  if (
    ids.some((id, index) => !id || id !== value[index]) ||
    new Set(ids).size !== ids.length
  ) return null

  return ids
}

export function readConsoleTargetAuthority(
  target: unknown
): ConsoleTargetAuthority | null {
  const operatorIds = strictTargetIds(targetField(target, 'operator_ids'), 50)
  const teamIds = strictTargetIds(targetField(target, 'team_ids'), 100)
  const joinRequestIds = strictTargetIds(
    targetField(target, 'join_requests'),
    100
  )

  if (!operatorIds || !teamIds || !joinRequestIds) return null
  return { operatorIds, teamIds, joinRequestIds }
}

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
    readConsoleTargetAuthority,
    targetHasTeam,
    targetHasOperator,
    targetHasConsoleAccess,
  }
}
