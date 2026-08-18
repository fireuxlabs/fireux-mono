<template>
  <div class="space-y-3">
    <div>
      <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
        Identity backdrop
      </p>
      <p class="text-sm text-dimmed">
        Base colour behind transparent Place identity media and inherited by linked entities.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <input
        v-model="draft"
        type="color"
        class="h-9 w-12 rounded border border-default bg-transparent p-1"
        :disabled="!canWrite"
        aria-label="Place identity backdrop colour"
      >
      <UInput
        v-model="draft"
        class="w-36"
        placeholder="#ffffff"
        :disabled="!canWrite"
        @blur="save"
        @keyup.enter="save"
      />
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        :disabled="!canWrite || saving || !storedColor"
        @click="clear"
      >
        Clear
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'
import { computed, ref, watch } from 'vue'
import type { PlaceMutationAuthority } from '../../composables/firestore/mutations/usePlaceUpdate'
import { usePlaceUpdate } from '../../composables/firestore/mutations/usePlaceUpdate'
import type { Place } from '../../models/place.model.ts'

const props = defineProps<{
  place: Place | null
  mutationAuthority?: PlaceMutationAuthority | null
  canWrite: boolean
}>()

const placeId = computed(() => String(props.place?.id || '').trim())
const storedColor = computed(() => String(props.place?.media_backdrop_color || '').trim())
const draft = ref('')
const saving = ref(false)
const toast = useToastify()
const { updateMediaBackdropColor } = usePlaceUpdate({
  authority: () => props.mutationAuthority || null,
})

watch(storedColor, value => { draft.value = value }, { immediate: true })

async function save() {
  if (!props.canWrite || !placeId.value || saving.value) return
  const color = normalizeHexColor(draft.value)
  if (color === null) {
    toast.error('Use a 6-digit hex colour.')
    return
  }

  saving.value = true
  try {
    await updateMediaBackdropColor(color || '', { id: placeId.value })
    toast.success('Place backdrop updated')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update Place backdrop: ${message}`)
    throw error
  } finally {
    saving.value = false
  }
}

async function clear() {
  draft.value = ''
  await save()
}
</script>
