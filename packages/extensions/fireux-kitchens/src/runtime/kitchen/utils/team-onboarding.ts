export type TeamOnboardingDraft = {
  kitchenId: string
  name: string
  userId?: string
  role: 'member' | 'operator'
  invite: boolean
}
export type TeamOnboardingProgress = {
  memberId: string
  name: string
  responsibilitySaved: boolean
  invitationLink: string
  creationAttempted: boolean
  complete: boolean
  busy: boolean
  error: string
}
export function createTeamOnboardingProgress(): TeamOnboardingProgress {
  return {
    memberId: '',
    name: '',
    responsibilitySaved: false,
    invitationLink: '',
    creationAttempted: false,
    complete: false,
    busy: false,
    error: '',
  }
}
export async function runTeamOnboarding(
  draft: TeamOnboardingDraft,
  progress: TeamOnboardingProgress,
  commands: {
    currentKitchenId: () => string
    create: (input: {
      kitchenId: string
      name: string
      userId?: string
    }) => Promise<{ memberId: string; name: string }>
    update: (input: {
      kitchenId: string
      memberId: string
      changes: { name: string; role: 'operator' }
    }) => Promise<unknown>
    invite: (input: {
      kitchenId: string
      memberId: string
    }) => Promise<{ link: string }>
  }
) {
  if (progress.busy || progress.complete) return
  progress.busy = true
  progress.error = ''
  const requireCurrent = () => {
    if (draft.kitchenId !== commands.currentKitchenId())
      throw new Error(
        'The workspace changed. Return to the original workspace to continue.'
      )
  }
  try {
    requireCurrent()
    if (!progress.memberId) {
      if (progress.creationAttempted)
        throw new Error(
          'Creation could not be confirmed. Check People before starting again to avoid a duplicate.'
        )
      progress.creationAttempted = true
      const result = await commands.create({
        kitchenId: draft.kitchenId,
        name: draft.name,
        ...(draft.userId ? { userId: draft.userId } : {}),
      })
      progress.memberId = result.memberId
      progress.name = result.name
    }
    requireCurrent()
    if (!progress.responsibilitySaved) {
      if (draft.role === 'operator')
        await commands.update({
          kitchenId: draft.kitchenId,
          memberId: progress.memberId,
          changes: { name: progress.name, role: 'operator' },
        })
      progress.responsibilitySaved = true
    }
    requireCurrent()
    if (draft.invite && !draft.userId && !progress.invitationLink) {
      progress.invitationLink = (
        await commands.invite({
          kitchenId: draft.kitchenId,
          memberId: progress.memberId,
        })
      ).link
    }
    progress.complete = true
  } catch (cause) {
    progress.error =
      cause instanceof Error ? cause.message : 'Onboarding could not finish.'
    if (!progress.memberId && progress.creationAttempted)
      progress.error +=
        ' Check People before starting again; creation may have succeeded.'
  } finally {
    progress.busy = false
  }
}
