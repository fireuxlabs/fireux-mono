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
      workspace.value.state.project.id || workspace.value.state.project.name
        ? 'Ask ProjectAI about this Project…'
        : 'Tell us about your Project…'
    ),
    submitting: false,
    suggestions: computed(() => {
      const { state, derived } = workspace.value
      const primitives = [
        ...(derived.create.allowed
          ? [{ label: 'Create a Project', icon: 'i-lucide-plus' }]
          : []),
        ...(state.appUser.projects.length
          ? [{ label: 'Read my Projects', icon: 'i-lucide-list' }]
          : []),
      ]
      const onboarding =
        state.user.anonymous ||
        !state.project.id ||
        !state.project.name ||
        !state.project.tagline ||
        !state.project.url

      if (onboarding) {
        return [
          ...primitives,
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
        ].slice(0, 4)
      }

      return [
        ...primitives,
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
