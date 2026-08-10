<template>
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">
          Place colours
        </div>
        <p class="text-sm text-dimmed">
          Optional colours owned by this Place and available to linked experiences.
        </p>
      </div>
    </template>

    <div class="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <MoleculesFormsBrandPalette
        :model-value="draft"
        active-label="Selected"
        inherit-label="Optional"
        reset-label="Clear"
        @update:model-value="setDraft"
      />

      <div class="flex items-end">
        <UButton
          label="Save colours"
          icon="i-lucide-palette"
          color="neutral"
          variant="soft"
          :loading="saving"
          :disabled="saving || !changed"
          @click="save"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import { computed, ref, watch } from 'vue'
import {
  type PlaceMutationAuthority,
  usePlaceUpdate,
} from '../../../composables/fireux/firestore/place/mutations/usePlaceUpdate'
import type { Place } from '../../../models/place.model'

const props = defineProps<{
  place: Place
  mutationAuthority?: PlaceMutationAuthority | null
}>()
const source = computed<SparseBrandPalette>(() => props.place.brand_palette || {})
const draft = ref<SparseBrandPalette>({ ...source.value })
const saving = ref(false)
const changed = computed(() => JSON.stringify(draft.value) !== JSON.stringify(source.value))
const toast = useToastify()
const { updateBrandPalette } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})

watch(source, (value: SparseBrandPalette) => {
  if (!saving.value) draft.value = { ...value }
})

function setDraft(value: SparseBrandPalette) {
  draft.value = { ...value }
}

async function save() {
  if (!changed.value || saving.value) return
  saving.value = true
  try {
    await updateBrandPalette(draft.value, { id: props.place.id })
    toast.success('Place colours updated')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Could not update Place colours: ${message}`)
    throw error
  } finally {
    saving.value = false
  }
}
</script>
