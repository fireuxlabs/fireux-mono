import { computed, reactive, ref } from 'vue'
import { useToast } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from './useKitchenWorkspaceIndex'
import type {
  KitchenAICreatedObject,
  KitchenAIResultAction,
  KitchenAIWelcomeMessage,
} from '../../../components/Workspace/AI/types'

export function useKitchenAIIndex(
  getWorkspace: () => {
    state: Readonly<KitchenWorkspaceIndexState>
    derived: Readonly<KitchenWorkspaceIndexDerived>
  }
) {
  const { appId } = useFireUXConfig()
  const toast = useToast()
  const prompt = ref('')
  const messages = ref<KitchenAIWelcomeMessage[]>([])
  const submitting = ref(false)
  const workspace = computed(getWorkspace)
  const kitchen = computed(() => workspace.value.state.kitchen)
  let messageId = 0

  const state = reactive({ prompt, messages })
  const derived = reactive({
    placeholder: computed(() =>
      kitchen.value.name ? 'Ask Kitchen AI…' : 'Tell us about your Kitchen…'
    ),
    submitting,
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
        {
          label: 'How can Misebox improve my Kitchen?',
          icon: 'i-lucide-chef-hat',
        },
      ]
    }),
  })

  function addMessage(
    role: KitchenAIWelcomeMessage['role'],
    text: string,
    result: Pick<KitchenAIWelcomeMessage, 'createdObject' | 'resultAction'> = {}
  ) {
    messages.value.push({ id: ++messageId, role, text, ...result })
  }

  async function sendPrompt() {
    const text = prompt.value.trim()
    if (!text || submitting.value) return
    addMessage('user', text)
    prompt.value = ''
    submitting.value = true
    try {
      const user = await useRequireUser()
      const response = await $fetch<{
        ok: true
        answer: string
        createdObject?: KitchenAICreatedObject
        resultAction?: KitchenAIResultAction
      }>('/api/workspace/kitchen/agent', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          appId: String(appId || '').trim(),
          ...(kitchen.value.id ? { kitchenId: kitchen.value.id } : {}),
          prompt: text,
        },
      })
      addMessage('assistant', response.answer, {
        createdObject: response.createdObject,
        resultAction: response.resultAction,
      })
    } catch (cause) {
      const failure = cause as {
        data?: { statusMessage?: string; message?: string }
        message?: string
      }
      addMessage(
        'assistant',
        failure.data?.statusMessage ||
          failure.data?.message ||
          failure.message ||
          'This request could not be completed.'
      )
    } finally {
      submitting.value = false
    }
  }

  async function copyResult(action: KitchenAIResultAction) {
    const value = new URL(action.value, window.location.origin).toString()
    await navigator.clipboard.writeText(value)
    toast.add({ title: 'Invitation link copied', color: 'success' })
  }

  function stageFile(file: File) {
    addMessage('user', `Use my menu: ${file.name}`)
    addMessage(
      'assistant',
      `I can see ${file.name}. File analysis is not connected, so the file has not left your browser.`
    )
  }

  return {
    state,
    derived,
    actions: {
      sendPrompt,
      copyResult,
      stageFile,
    },
  }
}
