<template>
  <WorkspaceAI aria-label="KitchenAI" compact>
    <p v-if="message" role="status" class="whitespace-pre-line text-sm">
      {{ message }}
    </p>
    <FireCopyError v-if="error" :message="error" />
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(ready && prompt.trim() && !submitting)"
      :submitting="submitting"
      placeholder="Ask about your Kitchen or what to do next…"
      aria-label="Ask KitchenAI"
      :model-label="developmentModelLabel"
      :suggestions="suggestions"
      @submit="ask"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenAIHandoff } from '../../../composables/workspace/useKitchenAIHandoff'
import type { KitchenLandingIntent } from '../../../models/landing-intent'

const props = defineProps<{
  performAction: (intent: KitchenLandingIntent) => boolean | Promise<boolean>
}>()
const developmentModelLabel = import.meta.dev
  ? 'FireUX · Codex development'
  : undefined
const page = useWorkspacePageState('kitchen')
const { currentUser } = useAuth()
const handoff = useKitchenAIHandoff()
const prompt = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)
let active = true
let revision = 0
onBeforeUnmount(() => {
  active = false
})
const ready = computed(() =>
  ['ready', 'empty'].includes(
    String(page.state.value?.derived?.landingState || '')
  )
)
const context = computed(() => {
  const state = page.state.value
  const collection = state?.collection as
    | { records?: { id: string; name: string }[] }
    | undefined
  const selected = state?.selected as { id?: string } | null | undefined
  return {
    intro: state?.intro,
    collection: {
      records: (collection?.records || []).map(({ id, name }) => ({
        id,
        name,
      })),
    },
    selected: selected?.id ? { id: selected.id } : null,
    derived: {
      canCreate: state?.derived.canCreate === true,
      canUpdate: state?.derived.canUpdate === true,
      status: state?.derived.landingState,
    },
  }
})
watch(
  () =>
    JSON.stringify({
      userId: currentUser.value?.uid || '',
      context: context.value,
    }),
  () => {
    revision++
  },
  { flush: 'sync' }
)
const suggestions = computed(() => [
  {
    label: page.state.value?.selected
      ? 'What can I do with this Kitchen?'
      : 'How do I get started?',
  },
  ...(page.state.value?.derived?.canCreate
    ? [{ label: 'Help me add a Kitchen' }]
    : []),
  { label: 'Explain my Kitchen allowance' },
])
async function ask() {
  if (!ready.value || !prompt.value.trim() || submitting.value) return
  const snapshot = JSON.stringify(context.value)
  const requestedRevision = revision
  const question = prompt.value.trim()
  const user = currentUser.value
  submitting.value = true
  error.value = ''
  try {
    const token = await user?.getIdToken()
    if (!active || requestedRevision !== revision) return
    const intent = await $fetch<KitchenLandingIntent>(
      '/api/workspace/kitchen/landing/intent',
      {
        method: 'POST',
        retry: 0,
        timeout: 65_000,
        headers: token ? { authorization: `Bearer ${token}` } : {},
        body: { prompt: question, context: JSON.parse(snapshot) },
      }
    )
    if (!active) return
    if (
      requestedRevision !== revision ||
      snapshot !== JSON.stringify(context.value)
    ) {
      message.value =
        'Your Kitchens or account changed. Ask again using the current view.'
      return
    }
    message.value = intent.message
    if (intent.action !== 'none') {
      if (intent.action === 'open' && intent.target === 'menus' && user?.uid) {
        handoff.value = {
          userId: user.uid,
          kitchenId: context.value.selected?.id || '',
          capability: 'menus',
          prompt: question,
          createdAt: Date.now(),
        }
      }
      const applied = await props.performAction(intent)
      if (!applied) handoff.value = null
      message.value = applied
        ? intent.action === 'create'
          ? 'Add Kitchen is open. Review the venue before confirming.'
          : intent.action === 'update'
            ? 'Kitchen settings are open for review.'
            : intent.message
        : 'That control is no longer available. Check the current selection and try again.'
    }
  } catch {
    error.value =
      'KitchenAI could not answer. Your Kitchens have not changed. Try again.'
  } finally {
    submitting.value = false
  }
}
</script>
