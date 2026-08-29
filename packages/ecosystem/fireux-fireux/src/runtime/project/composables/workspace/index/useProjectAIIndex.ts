import { computed, reactive, ref } from 'vue'
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'

export function useProjectAIIndex(
  getWorkspace: () => {
    state: Readonly<ProjectWorkspaceIndexState>
    derived: Readonly<ProjectWorkspaceIndexDerived>
  }
) {
  const prompt = ref('')
  const workspace = computed(getWorkspace)

  const state = reactive({ prompt })
  const derived = reactive({
    placeholder: computed(() =>
      workspace.value.derived.hasSelection || workspace.value.state.project.name
        ? 'Ask ProjectAI about this Project…'
        : 'Tell us about your Project…'
    ),
    submitting: false,
    suggestions: computed(() => {
      const { state, derived: workspaceDerived } = workspace.value
      const onboarding =
        state.user.anonymous ||
        !workspaceDerived.hasSelection ||
        !state.project.name ||
        !state.project.tagline ||
        !state.project.url

      if (onboarding) {
        return [
          {
            label: 'Help me build my Project Workspace',
            icon: 'i-lucide-sparkles',
          },
          {
            label: 'What should I set up first?',
            icon: 'i-lucide-compass',
          },
          {
            label: 'Help me describe my Project',
            icon: 'i-lucide-message-square-text',
          },
        ]
      }

      return [
        {
          label: 'What should I work on next?',
          icon: 'i-lucide-list-checks',
        },
        {
          label: 'Review my Project readiness',
          icon: 'i-lucide-shield-check',
        },
        {
          label: 'Help me plan this Project',
          icon: 'i-lucide-map',
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
