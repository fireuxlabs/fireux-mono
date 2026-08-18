import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

type TeamMemberAnchorSource = {
  name: string
  slug?: string
}

export function resolveKitchenTeamMemberAnchor(
  member: TeamMemberAnchorSource
): string {
  return (
    normalizeSlug(member.slug || member.name, { maxLength: 120 }) ||
    'team-member'
  )
}
