<template>
  <UCard v-if="show">
    <template #header>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-highlighted">
          Create dishes from menu draft
        </h3>
        <p class="text-sm text-dimmed">
          Review the draft above, then confirm to create or replace the menu
          dishes, sections, and menu items.
        </p>
      </div>
    </template>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <p class="text-sm text-highlighted">
          {{ sectionsCount }} section(s), {{ itemsCount }} dish item(s)
        </p>
        <p class="text-sm text-dimmed">
          Existing published menus keep their published status after confirm.
        </p>
      </div>

      <UButton
        icon="i-lucide-check-circle-2"
        :loading="pending"
        :disabled="!canConfirm"
        @click="confirmDraft"
      >
        Confirm and create dishes
      </UButton>
    </div>

    <p v-if="message" class="mt-3 text-sm text-success">
      {{ message }}
    </p>
    <p v-if="error" class="mt-3 text-sm text-error">
      {{ error }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'

const props = defineProps<{
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
const { requireWritableData } = useConsoleWriteGuard('kitchen')
const error = ref('')
const confirmResult = ref<Record<string, unknown> | null>(null)
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const records = (value: unknown) =>
  Array.isArray(value) ? value.map(record) : []
const sourceDraft = computed(() => record(record(props.source).ai_draft))
const uploadId = computed(() => text(record(props.source).id) || text(props.menuId))
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
const sectionsCount = computed(() => draftSections.value.length)
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
      text(props.appId) &&
      text(props.kitchenId) &&
      text(props.menuId) &&
      text(props.authToken) &&
      !alreadyApplied.value &&
      !props.blocked &&
      !pending.value
  )
)
const message = computed(() =>
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
    requireWritableData('live')
    // Creation stage 3: apply the reviewed draft into dishes, sections, items, and the public root menu row.
    const response = await fetch('/api/console/kitchen/menus/confirm', {
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
    error.value = cause instanceof Error
      ? cause.message
      : 'Menu confirmation failed.'
  } finally {
    pending.value = false
  }
}
</script>
