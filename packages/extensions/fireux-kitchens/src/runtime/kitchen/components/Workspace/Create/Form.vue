<template>
  <form class="grid gap-4" @submit.prevent="submit">
    <div v-if="title" class="grid gap-1">
      <h2 class="m-0 text-xl font-semibold text-highlighted">{{ title }}</h2>
      <p class="m-0 text-sm text-muted">
        Find your Kitchen or start with its name.
      </p>
    </div>

    <PlaceSearchBar v-model="query" placeholder="Search Kitchens" />

    <div v-if="isSearching" class="flex items-center gap-2 text-sm text-muted">
      <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
      Searching
    </div>

    <div v-else-if="results.length" class="grid gap-2">
      <button
        v-for="result in results"
        :key="result.id"
        type="button"
        class="flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition"
        :class="
          selection?.placeId === result.id
            ? 'border-primary bg-primary/5'
            : 'border-default hover:bg-elevated'
        "
        @click="selectPlace(result)"
      >
        <UAvatar
          :src="result.imageUrl || undefined"
          icon="i-lucide-store"
          size="md"
        />
        <span class="min-w-0 flex-1">
          <span class="block truncate font-medium text-highlighted">
            {{ result.name }}
          </span>
          <span
            v-if="resultAddress(result)"
            class="block truncate text-sm text-muted"
          >
            {{ resultAddress(result) }}
          </span>
        </span>
        <UIcon
          v-if="selection?.placeId === result.id"
          name="i-lucide-check"
          class="size-4 text-primary"
        />
      </button>
    </div>

    <p v-else-if="canStartWithName" class="m-0 text-sm text-muted">
      Didn’t find your Kitchen? Start with just a name for testing, mobile,
      virtual, temporary, private or production Kitchens.
    </p>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Kitchen could not be created"
      :description="error"
    />

    <UButton
      :label="submitLabel"
      icon="i-lucide-plus"
      type="submit"
      :loading="working"
      :disabled="!canSubmit || working"
      class="w-fit"
    />
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  usePlaceSearch,
  type PlaceSearchCell,
} from 'fireux-places/runtime/place/composables/usePlaceSearch'
import { useKitchenCreate } from '../../../composables/firestore/mutations/useKitchenCreate'

defineProps<{ title: string }>()
const emit = defineEmits<{
  (event: 'created', id: string): void
}>()
const { createKitchen } = useKitchenCreate()
const { query, results, isSearching } = usePlaceSearch({
  debugLabel: 'kitchens',
  type: 'kitchen',
})
const selection = ref<{ placeId: string; name: string } | null>(null)
const error = ref('')
const working = ref(false)
const searchComplete = ref(false)
const searchName = computed(() => query.value.trim())
const canStartWithName = computed(
  () =>
    Boolean(searchName.value) &&
    searchComplete.value &&
    !isSearching.value &&
    !results.value.length
)
const canSubmit = computed(() =>
  Boolean(selection.value || canStartWithName.value)
)
const submitLabel = computed(() => {
  if (selection.value) return `Use ${selection.value.name}`
  if (canStartWithName.value) return `Start ${searchName.value}`
  return 'Choose a Kitchen'
})

watch(query, () => {
  selection.value = null
  error.value = ''
  searchComplete.value = false
})

watch(isSearching, (searching, wasSearching) => {
  if (wasSearching && !searching) searchComplete.value = true
})

function resultAddress(value: PlaceSearchCell) {
  return String(value.shortAddress || value.formattedAddress || '').trim()
}

function selectPlace(value: PlaceSearchCell) {
  selection.value = {
    placeId: String(value.id || '').trim(),
    name: String(value.name || '').trim(),
  }
  error.value = ''
}

async function submit() {
  if (!canSubmit.value || working.value) return
  working.value = true
  error.value = ''
  try {
    const result = await createKitchen(
      selection.value
        ? { place_id: selection.value.placeId }
        : { name: searchName.value }
    )
    emit('created', result.id)
    query.value = ''
    selection.value = null
  } catch (cause) {
    const failure = cause as {
      data?: { statusMessage?: unknown; message?: unknown }
      statusMessage?: unknown
      message?: unknown
    }
    error.value = String(
      failure.data?.statusMessage ||
        failure.statusMessage ||
        failure.data?.message ||
        failure.message ||
        'Try again.'
    )
  } finally {
    working.value = false
  }
}
</script>
