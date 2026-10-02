<template>
  <WorkspaceAI aria-label="ProjectAI" compact>
    <p v-if="message" role="status" class="whitespace-pre-line text-sm">
      {{ message }}
    </p>
    <MoleculesCopyError v-if="error" :message="error" />
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(ready && prompt.trim() && !submitting)"
      :submitting="submitting"
      placeholder="Ask about your Project or what to do next…"
      aria-label="Ask ProjectAI"
      :model-label="developmentModelLabel"
      :suggestions="suggestions"
      @submit="ask"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ProjectLandingIntent } from '../../../models/landing-intent'

const props = defineProps<{
  performAction: (intent: ProjectLandingIntent) => boolean | Promise<boolean>
  canPrepareApp: boolean
}>()
const developmentModelLabel = import.meta.dev
  ? 'FireUX · Codex development'
  : undefined
const page = useWorkspacePageState('project')
const { currentUser } = useAuth()
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
      records: (collection?.records || [])
        .slice(0, 50)
        .map(({ id, name }) => ({ id, name })),
    },
    selected: selected?.id ? { id: selected.id } : null,
    derived: {
      canCreate: state?.derived.canCreate === true,
      canPrepareApp: props.canPrepareApp,
      status: state?.derived.landingState,
    },
  }
})
watch(
  () =>
    JSON.stringify({
      userId: currentUser.value?.uid || '',
      anonymous: currentUser.value?.isAnonymous ?? true,
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
      ? 'What can I do with this Project?'
      : 'How do I get started?',
  },
  ...(page.state.value?.derived?.canCreate
    ? [{ label: 'Open Create Project' }]
    : []),
  ...(props.canPrepareApp
    ? [{ label: 'Help me prepare a standalone App' }]
    : []),
  { label: 'Explain my Project allowance' },
])
async function ask() {
  if (!ready.value || !prompt.value.trim() || submitting.value) return
  const snapshot = JSON.stringify(context.value)
  const requestedRevision = revision
  const question = prompt.value.trim()
  const user = currentUser.value
  submitting.value = true
  error.value = ''
  message.value = ''
  let tokenTimer: ReturnType<typeof setTimeout> | undefined
  try {
    const token =
      user && !user.isAnonymous
        ? await Promise.race([
            user.getIdToken(),
            new Promise<never>((_, reject) => {
              tokenTimer = setTimeout(
                () => reject(new Error('Sign-in timed out')),
                10_000
              )
            }),
          ])
        : undefined
    clearTimeout(tokenTimer)
    if (!active || requestedRevision !== revision) return
    const intent = await $fetch<ProjectLandingIntent>(
      '/api/workspace/project/intent',
      {
        method: 'POST',
        retry: 0,
        timeout: 65_000,
        headers: token ? { authorization: `Bearer ${token}` } : {},
        body: {
          capability: 'landing',
          prompt: question,
          context: JSON.parse(snapshot),
        },
      }
    )
    if (!active) return
    if (
      requestedRevision !== revision ||
      snapshot !== JSON.stringify(context.value)
    ) {
      message.value =
        'Your Projects or account changed. Ask again using the current view.'
      return
    }
    message.value = intent.message
    if (intent.action !== 'none') {
      const applied = await props.performAction(intent)
      if (!active) return
      message.value = applied
        ? intent.action === 'create'
          ? 'Create Project is open. Enter a name and review it before confirming.'
          : intent.action === 'open'
            ? 'App setup is open for review. No App has been created or deployed.'
            : 'Project selected.'
        : 'That control is no longer available. Check the current selection and try again.'
    }
  } catch {
    if (active && requestedRevision === revision) {
      error.value =
        'ProjectAI could not answer. Your Projects have not changed. Try again.'
    }
  } finally {
    clearTimeout(tokenTimer)
    submitting.value = false
  }
}
</script>
