import { navigateTo, useState } from '#imports'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'

export function useKitchenWorkspaceTools() {
  const { isAuthenticated } = useAuth()
  const { currentId, currentName, currentDescription, currentImage } =
    useWorkspace('kitchen')
  const createKitchenOpen = useState(
    'kitchen-workspace-create-open',
    () => false
  )

  const kitchenComplete = computed(() =>
    Boolean(currentName.value && currentDescription.value && currentImage.value)
  )
  const kitchenTool = computed(() => {
    if (!currentId.value) {
      return {
        id: 'create-kitchen' as const,
        kind: 'create' as const,
        label: 'Create Kitchen',
        suggestion: 'Help me create my Kitchen',
      }
    }
    if (!kitchenComplete.value) {
      return {
        id: 'complete-kitchen' as const,
        kind: 'complete' as const,
        label: 'Complete Kitchen',
        suggestion: `Help me complete ${currentName.value || 'my Kitchen'}`,
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
    ].filter((suggestion): suggestion is string => Boolean(suggestion))
  )
  const availableActions = computed(() =>
    [kitchenTool.value?.id, userTool.value?.id, exploreAction.id].filter(
      (id): id is string => Boolean(id)
    )
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
      await navigateTo('/auth?redirect=/')
      return true
    }
    if (id === exploreAction.id) {
      await navigateTo(exploreAction.to)
      return true
    }
    return false
  }

  return {
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
