<template>
  <FireDisclosurePanel
    v-if="items.some((item) => item.candidateUrl)"
    title="Dish media review"
    :default-open="false"
  >
    <div class="mt-3 space-y-4">
      <p class="text-sm text-dimmed">
        Review each detected image before it can become Dish media. AI work is
        queued only where selected.
      </p>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <UCard
          v-for="item in items.filter((entry) => entry.candidateUrl)"
          :key="item.key"
        >
          <img
            v-if="item.candidateUrl"
            :src="item.candidateUrl"
            :alt="item.name"
            class="aspect-square w-full rounded-lg object-contain"
          />
          <div
            v-else
            class="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm text-dimmed"
          >
            No detected image
          </div>
          <p class="mt-3 text-sm font-medium text-highlighted">
            {{ item.name }}
          </p>
          <USelect
            v-model="decisions[item.key]"
            class="mt-2 w-full"
            :items="options"
          />
        </UCard>
      </div>
      <div class="flex items-center gap-3">
        <UButton :loading="pending" :disabled="!canSave" @click="save"
          >Save media review</UButton
        >
        <span v-if="message" class="text-sm text-success">{{ message }}</span>
        <span v-if="error" class="text-sm text-error">{{ error }}</span>
      </div>
    </div>
  </FireDisclosurePanel>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps<{
  source?: unknown
  result?: Record<string, unknown> | null
  appId: string
  kitchenId: string
  uploadId: string
  authToken: string
}>()
const emit = defineEmits<{ saved: [decisions: Record<string, unknown>] }>()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => String(value ?? '').trim()
const decisions = reactive<Record<string, string>>({})
const pending = ref(false)
const error = ref('')
const message = ref('')
const options = [
  { label: 'Keep image', value: 'keep' },
  { label: 'Reprocess with AI', value: 'reprocess-ai' },
  { label: 'Generate', value: 'generate' },
  { label: 'No image', value: 'none' },
]
const items = computed(() =>
  sections.value.flatMap((section, sectionIndex) => {
    const row = record(section)
    return (Array.isArray(row.items) ? row.items : []).map(
      (entry, itemIndex) => {
        const item = record(entry)
        return {
          key: `${sectionIndex}:${itemIndex}`,
          name: text(item.name),
          candidateUrl: text(item.image_url),
        }
      }
    )
  })
)
const sections = computed(() => {
  const normalized = record(props.result?.normalized).sections
  if (Array.isArray(normalized) && normalized.length) return normalized
  const extracted = record(props.result?.extracted).sections
  if (Array.isArray(extracted) && extracted.length) return extracted
  const persisted = record(record(props.source).ai_draft).sections
  return Array.isArray(persisted) ? persisted : []
})
const persisted = computed(() =>
  record(record(record(props.source).ai_draft).media_review)
)
watch(
  [items, persisted],
  () =>
    items.value.forEach((item) => {
      decisions[item.key] =
        text(record(persisted.value[item.key]).action) ||
        (item.candidateUrl ? 'keep' : 'none')
    }),
  { immediate: true }
)
const canSave = computed(() =>
  Boolean(
    props.appId &&
      props.kitchenId &&
      props.uploadId &&
      props.authToken &&
      !pending.value &&
      items.value.every((item) => decisions[item.key])
  )
)
async function save() {
  if (!canSave.value) return
  pending.value = true
  error.value = ''
  message.value = ''
  try {
    const payload = Object.fromEntries(
      items.value.map((item) => [
        item.key,
        { action: decisions[item.key], candidate_url: item.candidateUrl },
      ])
    )
    const response = await fetch('/api/workspace/kitchen/menus/media-review', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${props.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: props.appId,
        kitchenId: props.kitchenId,
        uploadId: props.uploadId,
        decisions: payload,
      }),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok)
      throw new Error(
        text(result?.statusMessage) || 'Media review could not be saved.'
      )
    message.value = text(result.message)
    emit('saved', payload)
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : 'Media review could not be saved.'
  } finally {
    pending.value = false
  }
}
</script>
