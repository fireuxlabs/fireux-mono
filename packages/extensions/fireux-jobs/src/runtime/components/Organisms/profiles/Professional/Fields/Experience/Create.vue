<template>
  <div
    class="space-y-5 rounded-xl border border-dashed border-primary-200 bg-white/95 p-5 shadow-sm"
  >
    <header class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600"
        >
          <UIcon name="i-lucide-map-pin" class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-medium text-primary-900">Add experience</p>
          <p class="text-xs text-neutral-500">
            Start by linking a Google Place. We’ll capture more details next.
          </p>
        </div>
      </div>
      <UBadge color="primary" variant="soft" size="xs">Creating</UBadge>
    </header>

    <UForm class="space-y-4" @submit.prevent="onSubmit">
      <UFormGroup label="Place ID" name="place_id">
        <UInput
          v-model="placeId.value"
          placeholder="e.g., ChIJWS2cLEkKkEcRPkeZB6EcnLk"
          autocomplete="off"
          spellcheck="false"
        />
      </UFormGroup>

      <UAlert icon="i-lucide-info" color="primary" variant="soft">
        <span class="text-sm"
          >Only the canonical Google Place ID is required right now.</span
        >
      </UAlert>

      <div class="text-xs text-neutral-500">
        Saved as:
        <span class="font-mono">{{ normalizedPlaceId || '—' }}</span>
      </div>
    </UForm>

    <footer class="flex justify-end gap-2">
      <UButton
        size="sm"
        variant="soft"
        color="neutral"
        :disabled="loading || !placeId.value"
        @click="handleClear"
      >
        Clear
      </UButton>
      <UButton
        size="sm"
        color="primary"
        icon="i-lucide-check"
        :loading="loading"
        :disabled="!normalizedPlaceId || loading"
        @click="onSubmit"
      >
        Save experience
      </UButton>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'

const placeId = defineModel<string>('placeId', { default: '' })

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: ExperienceItem): void
  (e: 'clear'): void
}>()

const normalizedPlaceId = computed(() => canonicalPlaceId(placeId.value))

function onSubmit() {
  if (!normalizedPlaceId.value || props.loading) return

  emit('save', {
    place_id: normalizedPlaceId.value,
  })
}

function handleClear() {
  placeId.value = ''
  emit('clear')
}

function canonicalPlaceId(id: string | null | undefined) {
  const normalized = (id ?? '').toString().trim()
  if (!normalized) return ''
  return normalized.replace(/^places\//, '')
}
</script>
