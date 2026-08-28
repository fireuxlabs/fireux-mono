import { navigateTo, useState } from '#imports'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { readKitchenPresentationIdentity } from '../../../utils/kitchen-presentation'
import { useKitchenCapabilityToolDirectory } from '../useKitchenCapabilityTools'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'

export function useKitchenWorkspaceMain(workspace = useKitchenWorkspace()) {
  const { currentUser, isAuthenticated } = useAuth()
  const { appAccess, appAccessOutcome, canOwnMultipleWorkspaces } = useUser()
  const capabilityTools = useKitchenCapabilityToolDirectory()
  const activeId = workspace.selection.kitchenId
  const activePresentation = computed(() =>
    readKitchenPresentationIdentity(workspace.selection.kitchen.value)
  )
  const activeName = computed(() => activePresentation.value.displayName)
  const activeDescription = computed(() => activePresentation.value.tagline)
  const activeImage = computed(
    () =>
      activePresentation.value.cardImageUrl ||
      activePresentation.value.imageUrl ||
      activePresentation.value.logoImageUrl
  )
  const createKitchenOpen = useState(
    'kitchen-workspace-create-open',
    () => false
  )
  const workspacePending = computed(
    () =>
      (isAuthenticated.value &&
        (appAccessOutcome.value === 'idle' ||
          appAccessOutcome.value === 'pending')) ||
      workspace.targets.pending.value ||
      workspace.targets.outcome.value === 'idle' ||
      workspace.targets.outcome.value === 'pending'
  )
  const hasExistingKitchen = computed(
    () => workspace.targets.kitchens.value.length > 0
  )
  const canCreateMultiple = canOwnMultipleWorkspaces
  const canCreateKitchen = computed(
    () =>
      workspace.runtime.canCreate.value &&
      (!hasExistingKitchen.value || canCreateMultiple.value)
  )
  const capacityConsumed = computed(
    () =>
      !workspacePending.value &&
      hasExistingKitchen.value &&
      !canCreateMultiple.value
  )
  const hasActiveKitchen = computed(() => Boolean(activeId.value))
  const kitchenComplete = computed(() =>
    Boolean(activeName.value && activeDescription.value && activeImage.value)
  )
  const state = computed(() => ({
    signedIn: Boolean(currentUser.value && !currentUser.value.isAnonymous),
    subscription: appAccess.value.subscription,
    activeKitchen: activeId.value
      ? {
          id: activeId.value,
          name: activeName.value,
          hasTagline: Boolean(activeDescription.value),
          hasImage: Boolean(activeImage.value),
        }
      : null,
    kitchenCount: workspace.targets.kitchens.value.length,
    kitchenComplete: kitchenComplete.value,
    canCreateKitchen: canCreateKitchen.value,
  }))
  const kitchenTool = computed(() => {
    if (workspacePending.value) return null
    if (capacityConsumed.value && !hasActiveKitchen.value) return null
    if (canCreateKitchen.value) {
      return {
        id: 'create-kitchen' as const,
        kind: 'create' as const,
        label: 'Create Kitchen',
        suggestion: hasActiveKitchen.value
          ? 'Help me create another Kitchen'
          : 'Tell us about your Kitchen',
      }
    }
    if (!kitchenComplete.value) {
      return {
        id: 'complete-kitchen' as const,
        kind: 'complete' as const,
        label: 'Complete Kitchen',
        suggestion: `Help me complete ${activeName.value || 'my Kitchen'}`,
      }
    }
    return null
  })
  const userTool = computed(() =>
    isAuthenticated.value
      ? null
      : {
          id: 'sign-up' as const,
          kind: 'signup' as const,
          label: 'Sign up',
          suggestion: 'Help me sign up',
        }
  )
  const exploreAction = {
    id: 'explore-misebox' as const,
    kind: 'navigate' as const,
    label: 'Explore Misebox',
    suggestion: 'Show me what Misebox can do',
    to: '/about',
  }
  const suggestions = computed(() =>
    [
      kitchenTool.value?.suggestion,
      userTool.value?.suggestion,
      exploreAction.suggestion,
      ...capabilityTools.tools.value.map(({ tool }) => `Use ${tool.label}`),
    ].filter((suggestion): suggestion is string => Boolean(suggestion))
  )
  const availableActions = computed(() =>
    [
      kitchenTool.value?.id,
      userTool.value?.id,
      exploreAction.id,
      ...capabilityTools.availableActions.value,
    ].filter((id): id is string => Boolean(id))
  )
  const startKitchen = () => {
    createKitchenOpen.value = true
  }
  const completeKitchen = () => navigateTo('/workspace/kitchen/identity')
  async function performAction(id: string) {
    if (id === 'create-kitchen' && kitchenTool.value?.kind === 'create') {
      startKitchen()
      return true
    }
    if (id === 'complete-kitchen' && kitchenTool.value?.kind === 'complete') {
      await completeKitchen()
      return true
    }
    if (id === 'sign-up' && userTool.value) {
      await navigateTo('/auth')
      return true
    }
    if (id === exploreAction.id) {
      await navigateTo(exploreAction.to)
      return true
    }
    return capabilityTools.performAction(id)
  }

  return {
    workspacePending,
    hasActiveKitchen,
    canCreateMultiple,
    canCreateKitchen,
    capacityConsumed,
    createKitchenOpen,
    activeName,
    activeDescription,
    activeImage,
    kitchenComplete,
    state,
    kitchenTool,
    userTool,
    exploreAction,
    suggestions,
    availableActions,
    startKitchen,
    completeKitchen,
    performAction,
  }
}
