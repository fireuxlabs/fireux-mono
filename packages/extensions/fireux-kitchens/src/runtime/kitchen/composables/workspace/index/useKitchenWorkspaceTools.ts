import { navigateTo, useState } from '#imports'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenCapabilityToolDirectory } from '../useKitchenCapabilityTools'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'

export function useKitchenWorkspaceTools(workspace = useKitchenWorkspace()) {
  const { isAuthenticated } = useAuth()
  const { appAccessOutcome, canOwnMultipleWorkspaces } = useUser()
  const { activeId, activeName, activeDescription, activeImage } =
    useWorkspace('kitchen')
  const createKitchenOpen = useState(
    'kitchen-workspace-create-open',
    () => false
  )
  const capabilityTools = useKitchenCapabilityToolDirectory()
  const accessPending = computed(
    () =>
      isAuthenticated.value &&
      (appAccessOutcome.value === 'idle' ||
        appAccessOutcome.value === 'pending')
  )
  const workspacePending = computed(
    () =>
      accessPending.value ||
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
      !workspacePending.value &&
      (!hasExistingKitchen.value || canCreateMultiple.value)
  )
  const capacityConsumed = computed(
    () =>
      !workspacePending.value &&
      hasExistingKitchen.value &&
      !canCreateMultiple.value
  )

  const kitchenComplete = computed(() =>
    Boolean(activeName.value && activeDescription.value && activeImage.value)
  )
  const kitchenTool = computed(() => {
    if (workspacePending.value) return null
    if (capacityConsumed.value && !activeId.value) return null
    if (canCreateKitchen.value) {
      return {
        id: 'create-kitchen' as const,
        kind: 'create' as const,
        label: 'Create Kitchen',
        suggestion: activeId.value
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

  async function performAction(id: string) {
    if (id === 'create-kitchen' && kitchenTool.value?.kind === 'create') {
      createKitchenOpen.value = true
      return true
    }
    if (id === 'complete-kitchen' && kitchenTool.value?.kind === 'complete') {
      await navigateTo('/workspace/kitchen/identity')
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
    canCreateMultiple,
    canCreateKitchen,
    capacityConsumed,
    createKitchenOpen,
    kitchenComplete,
    kitchenTool,
    userTool,
    exploreAction,
    suggestions,
    availableActions,
    performAction,
  }
}
