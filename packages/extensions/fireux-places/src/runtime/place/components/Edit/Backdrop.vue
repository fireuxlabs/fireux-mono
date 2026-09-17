<template>
  <div class="space-y-2">
    <MoleculesFormsEditableSimpleField
      label="Image background colour"
      :value="storedColor"
      placeholder="#ffffff"
      :update="save"
      :disabled="!canWrite"
    />
    <p class="text-xs text-muted">
      Shown behind transparent logos. Clear to use the default.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'
import { computed } from 'vue'
import type { PlaceMutationAuthority } from '../../composables/firestore/mutations/usePlaceUpdate'
import { usePlaceUpdate } from '../../composables/firestore/mutations/usePlaceUpdate'
import type { Place } from '../../models/place.model'

const props = defineProps<{
  place: Place | null
  mutationAuthority?: PlaceMutationAuthority | null
  canWrite: boolean
}>()
const placeId = computed(() => String(props.place?.id || '').trim())
const storedColor = computed(() =>
  String(props.place?.media_backdrop_color || '').trim()
)
const toast = useToastify()
const { updateMediaBackdropColor } = usePlaceUpdate({
  authority: () => props.mutationAuthority || null,
})

async function save(value: string) {
  if (!props.canWrite || !placeId.value)
    throw new Error('Edit access required.')
  const color = normalizeHexColor(value)
  if (color === null) throw new Error('Use a 6-digit hex colour.')
  await updateMediaBackdropColor(color || '', { id: placeId.value })
  toast.success('Image background colour updated')
}
</script>
