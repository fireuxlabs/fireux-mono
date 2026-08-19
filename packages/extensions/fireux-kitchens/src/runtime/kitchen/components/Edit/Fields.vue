<template>
  <MoleculesDisclosurePanel
    title="Kitchen"
    description="Kitchen-owned name, slug, and tagline overrides. Blank identity values inherit the linked Place."
    icon="i-lucide-store"
  >
    <UCard class="mt-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <MoleculesFormsFirestoreSimpleField
            label="Kitchen name override"
            :firebase-value="name"
            placeholder="Inherit the Place name"
            :maxlength="120"
            :disabled="!canWrite"
            disabled-message="This Kitchen is read-only."
            :update-function="handleName"
          />
        </div>

        <MoleculesFormsFirestoreSimpleField
          label="Slug"
          :firebase-value="slug"
          placeholder="luna-piccante"
          :maxlength="80"
          :disabled="!canWrite"
          disabled-message="This Kitchen is read-only."
          :validation-function="validateSlugField"
          :formatting-function="formatSlugField"
          :update-function="handleSlug"
        />

        <div class="md:col-span-2">
          <MoleculesFormsFirestoreSimpleField
            label="Tagline"
            :firebase-value="tagline"
            placeholder="Short service tagline"
            :maxlength="120"
            :disabled="!canWrite"
            disabled-message="This Kitchen is read-only."
            :update-function="handleTagline"
          />
        </div>
      </div>
    </UCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { computed } from 'vue'
import { useKitchenUpdate } from '../../composables/firestore/mutations/useKitchenUpdate'
import type { KitchenUpdateInput } from '../../models/kitchen.model.ts'
import { KitchenStorage } from '../../models/kitchen.model.ts'
import { readKitchenIdentity } from '../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()
const name = computed(() => readKitchenIdentity(props.kitchen).displayName)
const tagline = computed(() => readKitchenIdentity(props.kitchen).tagline)
const slug = computed(() => String(props.kitchen?.slug ?? ''))

async function updateKitchenField(
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) {
  if (!props.canWrite) throw new Error('This Kitchen is read-only.')
  if (!props.kitchenId) throw new Error('No Kitchen selected.')

  try {
    await updateKitchen({ kitchenId: props.kitchenId, changes: patch })
    toast.success(successTitle)
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast.error(`${failTitle}: ${description}`)
    throw error
  }
}

const handleName = (value: string) =>
  updateKitchenField(
    { 'identity.name': value },
    'Kitchen name updated',
    'Failed to update Kitchen name'
  )

const handleTagline = (value: string) =>
  updateKitchenField(
    { 'identity.tagline': value },
    'Tagline updated',
    'Failed to update tagline'
  )

const formatSlugField = (value: string) =>
  normalizeSlug(value, { maxLength: 80 })

const validateSlugField = (value: string) => {
  const validation = validateSlug(formatSlugField(value), {
    label: 'Kitchen slug',
    namespace: KitchenStorage.collection,
    reservedScope: 'root',
    maxLength: 80,
  })
  return { isValid: validation.isValid, message: validation.message }
}

const handleSlug = (value: string) =>
  updateKitchenField(
    { slug: formatSlugField(value) },
    'Slug updated',
    'Failed to update slug'
  )
</script>
