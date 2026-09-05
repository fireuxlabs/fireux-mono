import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'

export type KitchenTeamIntent = Omit<TeamAIIntent, 'action'> & {
  action: TeamAIIntent['action'] | 'onboard'
}

export const kitchenTeamOnboarding = {
  id: 'kitchen.team.onboard',
  label: 'Onboard a teammate',
  description:
    'Choose a person, set their responsibility and prepare an invitation link.',
  context:
    'Review the person, responsibility and invitation before confirming. Create one member, then set operator responsibility if requested, then prepare a one-use invitation for an unlinked person. Linked Users do not need a claim invitation. No message is sent. Each step uses the existing Team command and permission checks. Completed steps remain if a later step fails; retry continues from the saved member. If creation cannot be confirmed, inspect People before starting again.',
} as const
