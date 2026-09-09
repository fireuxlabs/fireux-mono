<template>
  <WorkspaceAI :aria-label="`${label} Test AI`" compact>
    <p v-if="message" role="status" class="text-sm text-muted">{{ message }}</p>
    <MoleculesCopyError v-if="error" :message="error" />
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(prompt.trim() && ready && !submitting)"
      :submitting="submitting"
      placeholder="Create, find, rename or delete a Test…"
      :aria-label="`Ask ${label} Test AI`"
      :suggestions="suggestions"
      @submit="prepare"
      @select-suggestion="prompt = $event.label"
    />
    <UModal
      v-model:open="reviewOpen"
      :title="reviewTitle"
      description="Review this action. Nothing changes until you confirm."
    >
      <template #body>
        <template v-if="prepared">
          <p
            v-if="prepared.action !== 'create'"
            class="mb-4 break-words text-sm"
          >
            {{ test.selected.value?.value }}
          </p>
          <TestForm
            v-if="prepared.action === 'create' || prepared.action === 'update'"
            :key="preparedKey"
            :initial-value="prepared.value"
            :label="
              prepared.action === 'create' ? 'Create Test' : 'Save change'
            "
            :submit="applyValue"
          />
          <UButton
            v-else
            label="Delete Test"
            color="error"
            :loading="applying"
            @click="applyDelete"
          />
          <MoleculesCopyError v-if="error" :message="error" />
        </template>
      </template>
    </UModal>
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import TestForm from './Form.vue'
import type { TestController } from '../../../composables/fireux/useTest'
import { useWorkspacePageState } from '../../../composables/fireux/workspace/useWorkspacePageState'
import { useRequireUser } from '../../../composables/fireux/firebase/useRequireUser'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import type { TestIntent } from '../../../models/test-intent'

const props = defineProps<{ test: TestController; family: string; label: string; endpoint: string }>()
const page = useWorkspacePageState(props.family)
const { currentUser } = useAuth()
const prompt = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)
const applying = ref(false)
const reviewOpen = ref(false)
const prepared = ref<TestIntent | null>(null)
const preparedKey = ref(0)
let preparedSnapshot = ''
let active = true
onBeforeUnmount(() => {
  active = false
})
const snapshot = computed(() => JSON.stringify({ context: page.state.value, userId: currentUser.value?.uid ?? '' }))
const ready = computed(() =>
  Boolean(
    props.test.id.value && !props.test.pending.value && !props.test.error.value
  )
)
const reviewTitle = computed(() =>
  prepared.value?.action === 'create'
    ? 'Create a Test'
    : prepared.value?.action === 'update'
      ? 'Update Test'
      : 'Delete Test'
)
const suggestions = computed(() => [
  { id: 'create', label: 'Create a Test saying Hello world' },
  { id: 'read', label: 'Show my Tests' },
  ...(props.test.selected.value
    ? [
        { id: 'update', label: 'Rename the selected Test to Hello world' },
        { id: 'delete', label: 'Delete the selected Test' },
      ]
    : []),
])
watch(snapshot, () => {
  if (reviewOpen.value && !applying.value) {
    reviewOpen.value = false
    prepared.value = null
    message.value =
      'The Tests or selection changed. Ask again using the current view.'
  }
})
async function prepare() {
  if (!ready.value || !prompt.value.trim() || submitting.value) return
  const context = JSON.parse(snapshot.value).context
  const requestedSnapshot = snapshot.value
  submitting.value = true
  error.value = ''
  message.value = ''
  reviewOpen.value = false
  prepared.value = null
  try {
    const user = await useRequireUser()
    const intent = await $fetch<TestIntent>(
      props.endpoint,
      {
        method: 'POST',
        retry: 0,
        timeout: 60_000,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: { prompt: prompt.value.trim(), context },
      }
    )
    if (!active) return
    if (snapshot.value !== requestedSnapshot) {
      message.value =
        'The Tests or selection changed. Ask again using the current view.'
      return
    }
    if (intent.action === 'none') {
      message.value = intent.message
    } else if (intent.action === 'read') {
      if (intent.recordId) props.test.select(intent.recordId)
      message.value = intent.recordId
        ? 'The Test is now in focus.'
        : `${props.test.records.value.length} Tests shown below.`
    } else {
      prepared.value = intent
      preparedSnapshot = requestedSnapshot
      preparedKey.value++
      reviewOpen.value = true
      message.value = 'Action prepared. Review it before applying.'
    }
  } catch {
    error.value =
      'Test AI could not prepare that action. Your Tests have not changed. Try again.'
  } finally {
    submitting.value = false
  }
}
function requireCurrent() {
  if (!prepared.value || !ready.value || snapshot.value !== preparedSnapshot) {
    reviewOpen.value = false
    throw new Error('The Tests changed. Prepare the action again.')
  }
  return prepared.value
}
async function applyValue(value: string) {
  const intent = requireCurrent()
  applying.value = true
  try {
    if (intent.action === 'create') await props.test.create(value)
    else if (intent.action === 'update')
      await props.test.update(intent.recordId, value)
    else throw new Error('Prepare a create or update action.')
    reviewOpen.value = false
    prepared.value = null
    message.value = 'Test saved.'
  } finally {
    applying.value = false
  }
}
async function applyDelete() {
  if (applying.value) return
  error.value = ''
  try {
    const intent = requireCurrent()
    if (intent.action !== 'delete') return
    applying.value = true
    await props.test.remove(intent.recordId)
    reviewOpen.value = false
    prepared.value = null
    message.value = 'Test deleted.'
  } catch {
    error.value =
      'Delete could not be confirmed. Check the Tests before trying again.'
  } finally {
    applying.value = false
  }
}
</script>
