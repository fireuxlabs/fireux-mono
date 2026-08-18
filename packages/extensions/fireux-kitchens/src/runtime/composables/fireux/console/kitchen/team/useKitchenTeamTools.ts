export type KitchenTeamTool = {
  id: 'add-member' | 'create-invitation' | 'update-member' | 'delete-member'
  group: 'create' | 'update'
  label: string
  description: string
  icon: string
  context: {
    object: 'KitchenTeamMember'
    instruction: string
    requestTemplate: string
    inputs?: readonly {
      name: string
      description: string
      required: boolean
    }[]
    outcome?: string
    constraints?: readonly string[]
  }
}

const kitchenTeamTools = [
  {
    id: 'add-member',
    group: 'create',
    label: 'Add a member',
    description: 'Add a named person to this Kitchen Team.',
    icon: 'i-lucide-user-plus',
    context: {
      object: 'KitchenTeamMember',
      instruction:
        'Create a named Kitchen Team member who is not yet linked to a User.',
      requestTemplate: 'Add a new Team member named Alex',
      inputs: [
        {
          name: 'name',
          description: 'The name used to identify the new Team member.',
          required: true,
        },
      ],
      outcome:
        'Creates one active KitchenTeamMember in the selected Kitchen Team.',
      constraints: [
        'Creating a named Team member does not create or link a User.',
        'Creating a named Team member does not grant Console access.',
      ],
    },
  },
  {
    id: 'create-invitation',
    group: 'create',
    label: 'Create an invitation',
    description: 'Create a one-use link for an unlinked member.',
    icon: 'i-lucide-link',
    context: {
      object: 'KitchenTeamMember',
      instruction:
        'Create a one-use invitation for an existing unlinked Kitchen Team member.',
      requestTemplate: 'Invite {existingTeamMemberName}',
    },
  },
  {
    id: 'update-member',
    group: 'update',
    label: 'Update a member',
    description: 'Update a selected Team member.',
    icon: 'i-lucide-user-pen',
    context: {
      object: 'KitchenTeamMember',
      instruction:
        'Update the supported fields of an existing Kitchen Team member.',
      requestTemplate: 'Update {existingTeamMemberName}',
    },
  },
  {
    id: 'delete-member',
    group: 'update',
    label: 'Delete a member',
    description: 'Delete an unlinked Team member and revoke pending invitations.',
    icon: 'i-lucide-user-minus',
    context: {
      object: 'KitchenTeamMember',
      instruction:
        'Delete an existing unlinked Kitchen Team member and revoke pending invitations.',
      requestTemplate: 'Delete {existingTeamMemberName}',
    },
  },
] as const satisfies readonly KitchenTeamTool[]

export function useKitchenTeamTools() {
  return kitchenTeamTools
}
