import { computed, reactive, ref } from 'vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from './useKitchenWorkspaceIndex'

export function useKitchenAIIndex(
  getWorkspace: () => {
    state: Readonly<KitchenWorkspaceIndexState>
    derived: Readonly<KitchenWorkspaceIndexDerived>
  }
) {
  const prompt = ref('')
  const workspace = computed(getWorkspace)

  const state = reactive({ prompt })
  const derived = reactive({
    placeholder: computed(() =>
      workspace.value.derived.hasSelection || workspace.value.state.kitchen.name
        ? 'Ask Kitchen AI…'
        : 'Tell us about your Kitchen…'
    ),
    submitting: false,
    suggestions: computed(() => {
      const { state, derived: workspaceDerived } = workspace.value
      const onboarding =
        state.user.anonymous ||
        !workspaceDerived.hasSelection ||
        !state.kitchen.name ||
        !state.kitchen.tagline ||
        !state.kitchen.url

      if (onboarding) {
        return [
          {
            label: 'Help me build my Kitchen Workspace',
            icon: 'i-lucide-sparkles',
          },
          { label: 'What should I set up first?', icon: 'i-lucide-compass' },
          {
            label: 'Help me describe my Kitchen',
            icon: 'i-lucide-message-square-text',
          },
        ]
      }

      return [
        {
          label: 'What needs attention today?',
          icon: 'i-lucide-sun',
        },
        {
          label: 'Help me organise my Menus',
          icon: 'i-lucide-book-open',
        },
        {
          label: 'Help me organise my Dishes',
          icon: 'i-lucide-utensils',
        },
      ]
    }),
  })

  function selectSuggestion(label: string) {
    state.prompt = label
  }

  return {
    state,
    derived,
    actions: { selectSuggestion },
  }
}
