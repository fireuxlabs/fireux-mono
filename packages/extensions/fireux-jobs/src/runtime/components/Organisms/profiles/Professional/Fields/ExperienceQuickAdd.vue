<template>
  <div class="space-y-4">
    <transition name="fade">
      <UAlert
        v-if="hasPrefill"
        color="primary"
        variant="soft"
        icon="i-lucide-map-pin"
        :title="prefillTitle"
      >
        <template #description>
          <div class="space-y-2">
            <p class="text-xs text-primary-700">
              The details below were pulled from Google Places. Quick add will
              link the experience to this location so the dashboard can enrich
              it automatically.
            </p>
            <div class="flex flex-wrap items-center gap-2 text-xs text-primary-700/80">
              <span v-if="prefillDescription" class="truncate">
                {{ prefillDescription }}
              </span>
              <UBadge
                v-if="selectedPlace?.place_id"
                size="xs"
                color="primary"
                variant="soft"
                class="font-mono"
              >
                {{ selectedPlace.place_id }}
              </UBadge>
              <UButton
                size="2xs"
                variant="ghost"
                color="primary"
                icon="i-lucide-x"
                @click="clearPrefill"
              >
                Clear
              </UButton>
            </div>
          </div>
        </template>
      </UAlert>
    </transition>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <UInput v-model="form.name" placeholder="Organization or project name" />
      <UInput v-model="form.role" placeholder="Role / title (optional)" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <UInput v-model="form.from_year" placeholder="From year (e.g. 2022)" />
      <UInput
        v-model="form.to_year"
        :disabled="form.ongoing"
        placeholder="To year (e.g. 2024)"
      />
      <UCheckbox v-model="form.ongoing" label="Ongoing" />
    </div>

    <UTextarea
      v-model="form.responsibilities"
      placeholder="What did you do? (optional)"
    />

    <div class="flex items-center gap-2">
      <UButton color="primary" :disabled="!canCreate" @click="create">
        Add experience
      </UButton>
      <span class="text-xs text-gray-500"
        >Quick add creates a single entry; edit later for details.</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { ExperienceItem } from '../../../../../models/profiles/Professional.model'

interface PrefillPlace {
  name: string
  place_id?: string | null
  formatted_address?: string | null
  short_address?: string | null
}

const props = defineProps<{
  prefillPlace?: PrefillPlace | null
  prefillKey?: number
}>()

const emit = defineEmits<{
  (e: 'create', item: ExperienceItem): void
  (e: 'clear-prefill'): void
}>()

const form = reactive<{
  name: string
  role: string
  from_year: string
  to_year: string
  ongoing: boolean
  responsibilities: string
  place_id: string | null
}>({
  name: '',
  role: '',
  from_year: '',
  to_year: '',
  ongoing: false,
  responsibilities: '',
  place_id: null,
})

const canCreate = computed(() => !!form.name && !!form.from_year)

const hasPrefill = computed(() => !!form.place_id)

const prefillTitle = computed(() =>
  props.prefillPlace?.name ? `Linked place: ${props.prefillPlace.name}` : 'Linked place ready'
)

const selectedPlace = computed(() => props.prefillPlace ?? null)

const prefillDescription = computed(
  () =>
    selectedPlace.value?.formatted_address ??
    selectedPlace.value?.short_address ??
    ''
)

watch(
  () => props.prefillKey,
  () => {
    if (!props.prefillPlace) return
    form.name = props.prefillPlace.name || form.name
    form.place_id = props.prefillPlace.place_id?.trim?.() || null
    if (!form.responsibilities && props.prefillPlace.formatted_address) {
      form.responsibilities = props.prefillPlace.formatted_address
    }
  },
  { immediate: true }
)

function clearPrefill() {
  form.place_id = null
  emit('clear-prefill')
}

function reset() {
  form.name = ''
  form.role = ''
  form.from_year = ''
  form.to_year = ''
  form.ongoing = false
  form.responsibilities = ''
  form.place_id = null
}

function create() {
  if (!canCreate.value) return
  const item: ExperienceItem = {
    name: form.name.trim(),
    role: form.role.trim() || undefined,
    from_year: form.from_year.trim(),
    to_year: form.ongoing ? null : form.to_year.trim() || null,
    ongoing: form.ongoing,
    responsibilities: form.responsibilities.trim() || undefined,
    place_id: form.place_id || undefined,
  }
  emit('create', item)
  if (form.place_id) {
    emit('clear-prefill')
  }
  reset()
}
</script>
