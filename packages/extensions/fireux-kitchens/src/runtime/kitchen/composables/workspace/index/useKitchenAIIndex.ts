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
      workspace.value.state.kitchen.id || workspace.value.state.kitchen.name
        ? 'Ask Kitchen AI…'
        : 'Tell us about your Kitchen…'
    ),
    submitting: false,
    suggestions: computed(() => {
      const { state, derived } = workspace.value
      const primitives = [
        ...(derived.capability.primitives.create.available
          ? [{ label: 'Create a Kitchen', icon: 'i-lucide-plus' }]
          : []),
        ...(derived.capability.primitives.read.available
          ? [{ label: 'Read my Kitchens', icon: 'i-lucide-list' }]
          : []),
      ]
      const natives = derived.capability.natives.map((native) => ({
        label:
          native.id === 'adopt-existing-place'
            ? 'Create from an existing Place'
            : 'Create a name-only Kitchen',
        icon: 'i-lucide-sparkles',
      }))
      const onboarding =
        state.user.anonymous ||
        !state.kitchen.id ||
        !state.kitchen.name ||
        !state.kitchen.tagline ||
        !state.kitchen.url

      if (onboarding) {
        return [
          ...primitives,
          ...natives,
          {
            label: 'Help me build my Kitchen Workspace',
            icon: 'i-lucide-sparkles',
          },
          { label: 'What should I set up first?', icon: 'i-lucide-compass' },
          {
            label: 'Help me describe my Kitchen',
            icon: 'i-lucide-message-square-text',
          },
        ].slice(0, 4)
      }

      return [
        ...primitives,
        ...natives,
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
      ].slice(0, 4)
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
