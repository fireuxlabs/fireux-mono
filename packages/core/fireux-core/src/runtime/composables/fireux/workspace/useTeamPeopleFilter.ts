import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { WorkspaceTeamMember } from './useTeam'

export function useTeamPeopleFilter(
  source: MaybeRefOrGetter<readonly WorkspaceTeamMember[]>
) {
  const filter = ref('all')
  const options = computed(() => {
    const members = toValue(source)
    const counts = new Map<string, number>()
    for (const member of members) {
      const labels = [...new Set(member.organisationRoles || [])]
      for (const label of labels.length ? labels : [''])
        counts.set(label, (counts.get(label) || 0) + 1)
    }
    return [
      { label: `All people (${members.length})`, value: 'all' },
      ...[...counts]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, count]) => ({
          label: `${label || 'No assigned role'} (${count})`,
          value: `role:${label}`,
        })),
    ]
  })
  watch(options, (items: {label: string; value: string}[]) => {
    if (!items.some((item) => item.value === filter.value)) filter.value = 'all'
  })
  const filtered = computed(() =>
    toValue(source).filter(
      (member) =>
        filter.value === 'all' ||
        (filter.value === 'role:'
          ? !member.organisationRoles?.length
          : member.organisationRoles?.includes(filter.value.slice(5)))
    )
  )
  return { filter, options, filtered }
}
