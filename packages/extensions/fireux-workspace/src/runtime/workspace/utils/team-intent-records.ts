export const TEAM_INTENT_RECORD_LIMIT = 100

/** Keep the chosen person in the interpreter's bounded view of the roster. */
export function teamIntentRecords<Member extends { id: string }>(
  members: readonly Member[],
  selectedId: string
): Member[] {
  const records = members.slice(0, TEAM_INTENT_RECORD_LIMIT)
  if (members.length > records.length && selectedId) {
    const selected = members.findIndex((member) => member.id === selectedId)
    if (selected >= records.length)
      records[records.length - 1] = members[selected]!
  }
  return records
}
