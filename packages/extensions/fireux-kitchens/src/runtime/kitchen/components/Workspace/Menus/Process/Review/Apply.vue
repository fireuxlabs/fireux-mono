<template>
  <section v-if="show" class="space-y-4">
    <UFormField
      v-if="!existingMenuName"
      label="Menu name"
      required
      class="mb-4"
    >
      <UInput
        v-model="reviewedName"
        :maxlength="160"
        class="w-full"
        :disabled="pending || blocked"
      />
    </UFormField>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <p class="text-sm text-highlighted">
          {{ draftSections.length }} section(s), {{ itemsCount }} dish item(s)
        </p>
        <p class="text-sm text-dimmed">
          Creates separate dishes. Existing catalogue prices stay unchanged.
        </p>
        <p v-if="existingMenuName" class="text-sm text-warning">
          Replaces this Menu's content and keeps its publication status.
        </p>
      </div>

      <UButton
        icon="i-lucide-check-circle-2"
        :loading="pending"
        :disabled="!canConfirm"
        @click="confirmDraft"
      >
        {{ existingMenuName ? 'Replace Menu content' : 'Create draft Menu' }}
      </UButton>
    </div>

    <p v-if="message" class="mt-3 text-sm text-success">
      {{ message }}
    </p>
    <UButton
      v-if="confirmedSlug"
      :to="`/workspace/kitchen/menus/${encodeURIComponent(confirmedSlug)}`"
      label="Open Menu"
      class="mt-3"
    />
    <MoleculesCopyError v-if="error" :message="error" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'

const props = defineProps<{
  existingMenuName?: string
  source?: unknown | null
  result?: Record<string, unknown> | null
  appId: string
  kitchenId: string
  menuId: string
  authToken: string
  blocked?: boolean
}>()
const emit = defineEmits<{
  confirmed: [payload: Record<string, unknown>]
}>()

const pending = ref(false)
const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
const error = ref('')
const confirmResult = ref<Record<string, unknown> | null>(null)
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const records = (value: unknown) =>
  Array.isArray(value) ? value.map(record) : []
const confirmedSlug = computed(() =>
  text(record(confirmResult.value?.write).slug)
)
const sourceDraft = computed(() => record(record(props.source).ai_draft))
const uploadId = computed(
  () => text(record(props.source).id) || text(props.menuId)
)
const reviewedName = ref('')
const suggestedName = computed(
  () =>
    text(sourceDraft.value.name) || text(record(props.result?.extracted).name)
)
watch(
  [uploadId, suggestedName],
  ([id, suggestion], previous) => {
    if (id !== previous?.[0] || !reviewedName.value)
      reviewedName.value = suggestion
  },
  { immediate: true }
)
const resultDraft = computed(() => {
  const normalized = records(record(props.result?.normalized).sections)
  return normalized.length
    ? normalized
    : records(record(props.result?.extracted).sections)
})
const draftSections = computed(() => {
  const sections = records(sourceDraft.value.sections)
  return sections.length ? sections : resultDraft.value
})
const itemsCount = computed(() =>
  draftSections.value.reduce(
    (count, section) => count + records(section.items).length,
    0
  )
)
const alreadyApplied = computed(() =>
  Boolean(Object.keys(record(sourceDraft.value.applied)).length)
)
const show = computed(() =>
  Boolean(props.source && (itemsCount.value || props.result))
)
const canConfirm = computed(() =>
  Boolean(
    itemsCount.value &&
      (props.existingMenuName ||
        (reviewedName.value.trim() &&
          reviewedName.value.trim().length <= 160)) &&
      text(props.appId) &&
      text(props.kitchenId) &&
      text(props.menuId) &&
      text(props.authToken) &&
      !alreadyApplied.value &&
      !props.blocked &&
      !pending.value
  )
)
const message = computed(
  () =>
    text(confirmResult.value?.message) ||
    (alreadyApplied.value ? 'This menu draft has already been applied.' : '')
)

async function confirmDraft() {
  error.value = ''
  confirmResult.value = null

  if (!canConfirm.value) {
    error.value = alreadyApplied.value
      ? 'This menu draft has already been applied.'
      : 'Process a source into a dish draft before confirming.'
    return
  }

  pending.value = true

  try {
    requireWritableData()
    // Creation stage 3: apply the reviewed draft into dishes, sections, items, and the public root menu row.
    const response = await fetch('/api/workspace/kitchen/menus/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${props.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: props.appId,
        kitchenId: props.kitchenId,
        menuId: props.menuId,
        uploadId: uploadId.value,
        name: props.existingMenuName || reviewedName.value.trim(),
        confirmDishes: true,
      }),
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        text(payload?.statusMessage) ||
          text(payload?.message) ||
          `Confirm failed with status ${response.status}.`
      )
    }

    confirmResult.value = payload as Record<string, unknown>
    emit('confirmed', confirmResult.value)
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Menu confirmation failed.'
  } finally {
    pending.value = false
  }
}
</script>
