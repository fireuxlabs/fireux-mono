import type { WorkspaceIntro } from 'fireux-core/runtime/workspace/models/capability-context'

type ProjectLandingFacts = {
  status: string
  count: number
  canCreate: boolean
  canUpdate: boolean
  accountReady: boolean
  hasAccount: boolean
  configured: boolean
  subscription: string
  used: number
  limit: number | null
  publishedIdentity: boolean
}

export function projectWorkspaceIntro(
  facts?: ProjectLandingFacts
): WorkspaceIntro {
  const known = Boolean(facts?.accountReady && facts.hasAccount)
  const tier =
    facts?.subscription === 'business'
      ? 'Business'
      : facts?.subscription === 'premium'
        ? 'Premium'
        : 'Free'
  return {
    title: 'Project Workspace',
    purpose: facts?.count
      ? 'Your Projects, and the work that comes next.'
      : 'Give your next idea a place to grow.',
    data: 'These are Projects associated with your account in this app. The Project owns its records. A connected App owns its published description and image.',
    boundaries:
      'Selection opens the current Project’s capabilities. Editing a Project does not deploy its connected App.',
    access:
      'Saving requires a signed-in App account and the relevant Project access. A paid subscription does not grant access to an unrelated Project.',
    status: facts?.status || 'pending',
    recordCount: facts?.count,
    allowance: {
      configured: facts?.configured ?? false,
      ...(known && facts?.configured
        ? {
            subscription: facts.subscription,
            used: facts.used,
            limit: facts.limit,
          }
        : {}),
      description: !facts?.accountReady
        ? 'Waiting for your account allowance.'
        : !facts.configured
          ? 'Project creation allowance is not configured. An upgrade is not a confirmed remedy.'
          : !known
            ? 'Sign in to see your account allowance. Saving a new Project requires App membership.'
            : `${tier} · ${facts.used} associated Projects · ${facts.limit === null ? 'no subscription count limit' : `allowance ${facts.limit}`}.`,
      retained:
        'This page does not remove existing Projects when the creation allowance is reached. Editing still depends on Project access. The creation command checks Project associations when saving.',
    },
    tools: [
      {
        id: 'read',
        label: 'Choose a Project',
        description: 'Select a Project and open its capabilities.',
        available: Boolean(facts?.count),
        reason: facts?.count
          ? 'The loaded Projects are selectable.'
          : 'There are no loaded Projects to choose yet.',
      },
      {
        id: 'create',
        label: 'Create Project',
        description: 'Enter a name and confirm the creation form.',
        available: facts?.canCreate ?? false,
        reason: !facts?.accountReady
          ? 'Waiting for your account to load.'
          : !facts.configured
            ? 'No Project creation allowance is configured.'
            : facts.canCreate
              ? 'The form is available; saving rechecks sign-in, App membership and Project allowance.'
              : 'The current creation allowance or App configuration does not permit another Project.',
      },
      {
        id: 'update',
        label: 'Edit Project',
        description: facts?.publishedIdentity
          ? 'Edit the Project name. Description and image come from the connected App.'
          : 'Edit the selected Project’s name, description and image.',
        available: facts?.canUpdate ?? false,
        reason: facts?.canUpdate
          ? 'Review your changes and save them explicitly.'
          : 'Select a loaded Project associated with your signed-in account.',
      },
      {
        id: 'delete',
        label: 'Delete Project',
        description: 'Deletion is not offered on this landing page.',
        available: false,
        reason: 'Selection and identity editing do not delete the Project.',
      },
    ],
    ai: 'ProjectAI explains this page, selects loaded Projects and opens Create Project for review. In FireUX, it can open App setup preparation when available. Chat does not save, edit or delete Projects, create Apps, provision infrastructure or deploy. Confirm changes through the existing forms.',
  }
}
