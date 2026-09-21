import type { WorkspaceIntro } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import type { resolveKitchenAllowance } from './kitchen-capacity'

type KitchenLandingFacts = {
  status: string
  count: number
  selected: boolean
  canCreate: boolean
  canUpdate: boolean
  accountReady: boolean
  hasAccount: boolean
  creationEnabled: boolean
  allowance: ReturnType<typeof resolveKitchenAllowance>
}

export function kitchenWorkspaceIntro(
  facts?: KitchenLandingFacts
): WorkspaceIntro {
  const known = Boolean(facts?.accountReady && facts.hasAccount)
  const allowance = facts?.allowance
  const tier =
    allowance?.subscription === 'business'
      ? 'Business'
      : allowance?.subscription === 'premium'
        ? 'Premium'
        : 'Free'
  const multiple = known && allowance?.subscription === 'business'
  const creationReason = !facts?.accountReady
    ? 'Waiting for your account to finish loading.'
    : !facts.hasAccount
      ? 'Sign in with an App account to create a Kitchen.'
      : !facts.creationEnabled
        ? 'Kitchen creation is not enabled in this app.'
        : !allowance?.hasCapacity
          ? `${tier} allows ${allowance?.limit} associated Kitchen. You already have ${allowance?.used}; Business allows more.`
          : !facts.canCreate
            ? 'This account has reached the supported Kitchen relationship limit.'
            : 'Review the Kitchen details before confirming creation.'
  return {
    title: 'Kitchen Workspace',
    purpose: facts?.count
      ? multiple
        ? 'Choose a Kitchen.'
        : 'Your Kitchen.'
      : 'Bring your venue, menus and team together.',
    data: 'These are Kitchens associated with your account in this app. Each Kitchen owns its menus and operational records; its linked Place owns the venue profile.',
    boundaries:
      'Choosing a Kitchen changes your current view. It does not transfer ownership or grant access.',
    access:
      'Managing a Kitchen requires a signed-in App account and access to that Kitchen. A subscription upgrade does not grant access to someone else’s Kitchen.',
    status: facts?.status || 'pending',
    recordCount: facts?.count,
    allowance: {
      configured: true,
      ...(known && allowance
        ? {
            subscription: allowance.subscription,
            used: allowance.used,
            limit: allowance.limit,
          }
        : {}),
      description: !known
        ? 'Sign in and let your account load to see your Kitchen allowance.'
        : `${tier} · ${allowance!.used} associated Kitchens · ${allowance!.limit === null ? 'no subscription count limit' : `allowance ${allowance!.limit}`}.`,
      retained:
        'Existing Kitchens stay available when you are over allowance. Reopening one does not use another place. Creating a Kitchen or adding an existing Kitchen both require spare allowance and the appropriate access.',
    },
    tools: [
      {
        id: 'read',
        label: multiple ? 'Choose a Kitchen' : 'Open your Kitchen',
        description: multiple
          ? 'Select one of your Kitchens and open its capabilities.'
          : 'Open capabilities for the selected Kitchen.',
        available: Boolean(facts?.count),
        reason: facts?.count
          ? multiple
            ? 'Your existing Kitchens remain selectable.'
            : 'The current Kitchen stays selected. Business provides the multi-Kitchen view.'
          : 'There are no loaded Kitchens to choose yet.',
      },
      {
        id: 'create',
        label: 'Add Kitchen',
        description:
          'Find an existing venue or start a new Kitchen in the same setup flow.',
        available: facts?.canCreate ?? false,
        reason: creationReason,
      },
      {
        id: 'update',
        label: 'Edit Kitchen settings',
        description:
          'Review and save settings for the selected Kitchen. Open Identity for its venue profile.',
        available: facts?.canUpdate ?? false,
        reason: facts?.canUpdate
          ? 'The selected Kitchen is loaded; the save command rechecks access.'
          : 'Choose a Kitchen and wait for its settings to load.',
      },
      {
        id: 'delete',
        label: 'Delete Kitchen',
        description: 'Deletion is not offered on this landing page.',
        available: false,
        reason: 'Selecting or editing here does not delete a Kitchen.',
      },
    ],
    ai: 'KitchenAI explains the current page and allowance, selects an existing Kitchen, and opens available Add, Edit or capability controls. It uses the same visible page facts and does not save or delete records. Review and confirm changes in the normal form. A changed account or selection invalidates a pending AI response.',
  }
}
