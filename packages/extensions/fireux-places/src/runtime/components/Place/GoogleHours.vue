<template>
  <div class="flex flex-col items-start gap-2 text-xs text-muted">
    <UButton
      v-if="showButton"
      size="xs"
      variant="soft"
      color="neutral"
      icon="i-logos-google-icon"
      :loading="pending"
      :disabled="!placeId"
      @click="load"
    >
      {{ buttonLabel }}
    </UButton>

    <p v-if="message" class="text-xs text-dimmed">
      {{ message }}
    </p>

    <div v-if="hours.length" class="fx-card__stack">
      <div v-for="line in hours" :key="line">{{ line }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  placeId: string
  autoLoad?: boolean
  showButton?: boolean
  buttonLabel?: string
}>(), {
  autoLoad: false,
  showButton: true,
  buttonLabel: 'View Google hours',
})

const pending = ref(false)
const message = ref('')
const hours = ref<string[]>([])

const clean = (value: unknown) => String(value ?? '').trim()

async function load() {
  if (!props.placeId || pending.value || typeof window === 'undefined') return

  pending.value = true
  message.value = ''

  try {
    const url = new URL('/api/places/details', window.location.origin)
    url.searchParams.set('place_id', props.placeId)
    const response = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const json = await response.json()
    const lines = Array.isArray(json?.result?.opening_hours?.weekday_text)
      ? json.result.opening_hours.weekday_text.map(clean).filter(Boolean)
      : []

    hours.value = lines
    message.value = lines.length
      ? 'Latest from Google.'
      : 'Google did not return operating hours for this place.'
  } catch (error) {
    hours.value = []
    message.value = 'Could not load operating hours from Google.'
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  if (props.autoLoad) load()
})

watch(() => props.placeId, () => {
  hours.value = []
  message.value = ''
  if (props.autoLoad) load()
})
</script>
