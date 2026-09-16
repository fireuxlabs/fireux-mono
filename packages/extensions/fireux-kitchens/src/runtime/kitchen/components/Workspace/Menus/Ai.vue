<template>
  <WorkspaceAI aria-label="KitchenAI · Menus" compact>
    <p class="text-sm font-medium">KitchenAI · Menus</p>
    <p v-if="message" role="status" class="whitespace-pre-line text-sm">
      {{ message }}
    </p>
    <MoleculesCopyError v-if="error" :message="error" />
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(ready && prompt.trim() && !submitting)"
      :submitting="submitting"
      placeholder="Ask about your menus…"
      aria-label="Ask KitchenAI about Menus"
      :model-label="developmentModelLabel"
      :suggestions="suggestions"
      @submit="ask()"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
import { useKitchenAIHandoff } from '../../../composables/workspace/useKitchenAIHandoff'
import { currentKitchenAIHandoff } from '../../../models/ai-handoff'
import type { KitchenMenusIntent } from '../../../models/menus-intent'

const workspace = useKitchenMenusContext()
const { currentUser } = useAuth()
const handoff = useKitchenAIHandoff()
const prompt = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)
const mounted = ref(false)
let active = true
let revision = 0
const developmentModelLabel = import.meta.dev
  ? 'FireUX · Codex development'
  : undefined
const context = computed(() => ({
  kitchenId: workspace.kitchenId.value,
  ...workspace.state.value,
  derived: workspace.derived.value,
}))
const snapshot = computed(() =>
  JSON.stringify({
    userId: currentUser.value?.uid || '',
    context: context.value,
  })
)
const ready = computed(() =>
  Boolean(
    currentUser.value?.uid &&
      workspace.kitchenId.value &&
      !workspace.kitchensPending.value &&
      ['ready', 'empty'].includes(workspace.derived.value.status)
  )
)
const suggestions = computed(() => [
  { label: 'Show my menus' },
  ...(workspace.derived.value.capability.primitives.create.available
    ? [{ label: 'Open Create Menu' }]
    : []),
  { label: 'Explain my menu allowance' },
])
watch(
  snapshot,
  () => {
    revision++
    message.value = ''
    error.value = ''
  },
  { flush: 'sync' }
)
watch(
  [() => currentUser.value?.uid || '', () => workspace.kitchenId.value],
  ([userId, kitchenId]: [string, string], [previousUserId]: [string, string]) => {
    const pending = handoff.value
    if (!pending) return
    if (
      (previousUserId && !userId) ||
      (userId && userId !== pending.userId) ||
      (kitchenId && kitchenId !== pending.kitchenId)
    )
      handoff.value = null
  },
  { flush: 'sync' }
)
onMounted(() => {
  mounted.value = true
})
onBeforeUnmount(() => {
  active = false
  revision++
})
watch(
  [mounted, ready, () => handoff.value],
  () => {
    if (!mounted.value || !ready.value || !handoff.value) return
    const pending = handoff.value
    handoff.value = null
    const accepted = currentKitchenAIHandoff(
      pending,
      currentUser.value?.uid || '',
      workspace.kitchenId.value
    )
    if (!accepted) return
    prompt.value = accepted.prompt
    void ask(accepted.prompt)
  },
  { immediate: true }
)

async function ask(question = prompt.value.trim()) {
  if (!ready.value || !question.trim() || submitting.value) return
  const requestedRevision = revision
  const requestedSnapshot = snapshot.value
  const user = currentUser.value
  const requestContext = JSON.parse(JSON.stringify(context.value))
  submitting.value = true
  error.value = ''
  message.value = ''
  try {
    const token = await user!.getIdToken()
    if (!active || requestedRevision !== revision) return
    const intent = await $fetch<KitchenMenusIntent>(
      '/api/workspace/kitchen/menus/intent',
      {
        method: 'POST',
        retry: 0,
        timeout: 65_000,
        headers: { authorization: `Bearer ${token}` },
        body: { prompt: question.trim(), context: requestContext },
      }
    )
    if (!active) return
    if (
      requestedRevision !== revision ||
      requestedSnapshot !== snapshot.value ||
      !ready.value
    ) {
      message.value =
        'Your kitchen, menus or account changed. Ask again using the current view.'
      return
    }
    if (intent.action === 'none') {
      message.value = intent.message
      return
    }
    const primitives = workspace.derived.value.capability.primitives
    if (intent.action === 'create' && primitives.create.available) {
      workspace.actions.openCreate()
      message.value = 'Create Menu is open. Review the form before saving.'
    } else if (intent.action === 'read' && primitives.read.available) {
      if (intent.target) {
        if (!workspace.menus.value.some((menu) => menu.id === intent.target))
          return
        workspace.selectedMenuId.value = intent.target
        message.value = 'The menu is now in focus.'
      } else {
        workspace.actions.openRead()
        message.value = 'Your menus are open.'
      }
    } else if (
      (intent.action === 'update' || intent.action === 'delete') &&
      primitives[intent.action].available &&
      intent.target === workspace.selectedMenuId.value
    ) {
      const menu = workspace.menus.value.find((candidate) => candidate.id === intent.target)
      if (!menu?.slug) return
      const path = `/workspace/kitchen/menus/${encodeURIComponent(menu.slug)}`
      await navigateTo(
        intent.action === 'delete' ? `${path}#delete-menu` : path
      )
    } else {
      message.value =
        'That control is no longer available. Check the current selection and try again.'
    }
  } catch {
    if (active && requestedRevision === revision)
      error.value =
        'KitchenAI could not answer. Your menus have not changed. Try again.'
  } finally {
    submitting.value = false
  }
}
</script>
