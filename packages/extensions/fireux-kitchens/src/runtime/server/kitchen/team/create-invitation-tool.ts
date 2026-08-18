import type { H3Event } from 'h3'
import { createKitchenMemberInvitation } from './member-invitation.ts'

export const createKitchenTeamInvitationTool = {
  id: 'kitchen.team.create-invitation',
  mode: 'write',
  confirmation: 'required',
  description:
    'Create a one-use, seven-day invitation link for an existing unclaimed Kitchen member.',
  result: {
    kind: 'share-link',
    audience: 'operator',
    primaryAction: 'copy',
    label: 'Copy invitation link',
  },
} as const

export function executeCreateKitchenTeamInvitationTool(
  event: H3Event,
  input: { kitchenId: string; memberId: string }
) {
  return createKitchenMemberInvitation(event, input)
}
