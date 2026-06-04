<template>
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">
          Kitchen identity
        </div>
      </div>
    </template>

    <div class="grid gap-4">
      <MoleculesFormsFirestoreSimpleField
        v-if="!hasLinkedPlace"
        label="Kitchen name"
        :firebase-value="displayName"
        placeholder="Public kitchen name"
        :maxlength="120"
        :update-function="handleDisplayName"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Tagline"
        :firebase-value="tagline"
        placeholder="Short public line"
        :maxlength="140"
        :update-function="handleTagline"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Food gallery image URLs"
        type="textarea"
        :rows="4"
        :firebase-value="foodGalleryText"
        placeholder="One image URL per line"
        :maxlength="1600"
        :update-function="handleFoodGallery"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import { useKitchenUpdate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { Kitchen, KitchenUpdateInput } from '../../../models/kitchen.model'

const props = defineProps<{
  kitchen: Partial<Kitchen> | Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()

const clean = (value: unknown) => String(value ?? '').trim()
const kitchenId = computed(() => clean(props.kitchenId))
const hasLinkedPlace = computed(() => Boolean(clean((props.kitchen as any)?.place_id)))
const displayName = computed(() => clean((props.kitchen as any)?.display_name))
const tagline = computed(() => clean((props.kitchen as any)?.tagline))
const foodGallery = computed(() =>
  Array.isArray((props.kitchen as any)?.food_gallery)
    ? ((props.kitchen as any).food_gallery as unknown[]).map(clean).filter(Boolean)
    : []
)
const foodGalleryText = computed(() => foodGallery.value.join('\n'))

const normalizeStringArray = (value: string) =>
  value
    .split(/\n|,/)
    .map(clean)
    .filter(Boolean)

async function updateKitchenIdentity(
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) {
  if (!props.canWrite) throw new Error('This kitchen is read-only.')
  if (!kitchenId.value) throw new Error('Kitchen id is required.')

  try {
    await updateKitchen(kitchenId.value, patch)
    toast.success(successTitle)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`${failTitle}: ${msg}`)
    throw error
  }
}

async function handleDisplayName(value: string) {
  await updateKitchenIdentity(
    { display_name: clean(value) },
    'Kitchen name updated',
    'Failed to update kitchen name'
  )
}

async function handleTagline(value: string) {
  await updateKitchenIdentity(
    { tagline: clean(value) },
    'Tagline updated',
    'Failed to update tagline'
  )
}

async function handleFoodGallery(value: string) {
  await updateKitchenIdentity(
    { food_gallery: normalizeStringArray(value) },
    'Food gallery updated',
    'Failed to update food gallery'
  )
}
</script>
