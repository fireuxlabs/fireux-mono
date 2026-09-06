import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { WorkspaceTeamMember } from './useTeam'

export function useTeamPeopleFilter(
  source: MaybeRefOrGetter<readonly WorkspaceTeamMember[]>
) {
  const filter = ref('all')
  const options = computed(() => {
    const members = toValue(source)
    const jobs = new Map<string, number>()
    const roles = new Map<string, number>()
    for (const member of members) {
      const titles = [
        ...new Set(
          [
            ...(member.organisationRoles || []),
            member.jobTitle?.trim() || '',
          ].filter(Boolean)
        ),
      ]
      for (const title of titles.length ? titles : [''])
        jobs.set(title, (jobs.get(title) || 0) + 1)
      if (member.role) roles.set(member.role, (roles.get(member.role) || 0) + 1)
    }
    return [
      { label: `All people (${members.length})`, value: 'all' },
      ...[...jobs]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([title, count]) => ({
          label: `${title ? `Role: ${title}` : 'No assigned role'} (${count})`,
          value: `job:${title}`,
        })),
      ...[...roles]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([role, count]) => ({
          label: `Access: ${role} (${count})`,
          value: `role:${role}`,
        })),
    ]
  })
  watch(options, (items: { label: string; value: string }[]) => {
    if (!items.some((item) => item.value === filter.value)) filter.value = 'all'
  })
  const filtered = computed(() =>
    toValue(source).filter((member) => {
      if (filter.value === 'all') return true
      if (filter.value.startsWith('job:')) {
        const titles = [...(member.organisationRoles || []), member.jobTitle?.trim() || ''].filter(Boolean)
        return filter.value === 'job:' ? titles.length === 0 : titles.includes(filter.value.slice(4))
      }
      return member.role === filter.value.slice(5)
    })
  )
  return { filter, options, filtered }
}
