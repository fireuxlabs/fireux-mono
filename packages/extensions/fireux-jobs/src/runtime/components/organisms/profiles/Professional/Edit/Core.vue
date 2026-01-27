<template>
  <ClientOnly>
    <div v-if="professional" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Headline"
            :firebase-value="headline"
            placeholder="Ex: Freelance Chef"
            :maxlength="60"
            :update-function="handleHeadline"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Summary"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="summary"
            placeholder="Short listing summary"
            :update-function="handleSummary"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Bio"
            type="textarea"
            :rows="6"
            :maxlength="2000"
            :firebase-value="bio"
            placeholder="Long-form professional bio"
            :update-function="handleBio"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Professional Image URL"
            :firebase-value="imageUrl"
            placeholder="Optional: image URL for this professional profile"
            :maxlength="400"
            :update-function="handleImage"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Service Types"
            :firebase-value="serviceTypes"
            item-placeholder="Service type"
            new-item-placeholder="Add service type"
            :update-function="handleServiceTypes"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Work Areas"
            :firebase-value="workAreas"
            item-placeholder="Work area"
            new-item-placeholder="Add work area"
            :update-function="handleWorkAreas"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="professional profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from '#imports';
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify';
import { useProfessionalUpdate } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalUpdate';
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model';

const props = defineProps<{ professional: ProfessionalCore | null }>()

const toast = useToastify()

const {
  updateHeadline,
  updateSummary,
  updateBio,
  updateImage,
  updateServiceTypes,
  updateWorkAreasCsv,
} = useProfessionalUpdate()

const professional = computed(() => props.professional ?? null)

const headline = computed(
  () => professional.value?.professional_headline ?? professional.value?.title ?? ''
)
const summary = computed(
  () => professional.value?.professional_summary ?? professional.value?.bio_short ?? ''
)
const bio = computed(
  () => professional.value?.professional_bio ?? professional.value?.bio_long ?? ''
)
const imageUrl = computed(() => professional.value?.professional_image ?? '')

const serviceTypes = computed(() => {
  const list =
    professional.value?.professional_service_types?.length
      ? professional.value?.professional_service_types
      : professional.value?.specialties ?? []
  return Array.isArray(list) ? list : []
})

const workAreas = computed(() => {
  const list =
    Array.isArray(professional.value?.professional_work_areas) &&
    professional.value?.professional_work_areas.every((x) => typeof x === 'string')
      ? (professional.value?.professional_work_areas as string[])
      : professional.value?.locations ?? []
  return Array.isArray(list) ? list : []
})

const wrap = async (fn: () => Promise<void>, okTitle: string, failTitle: string) => {
  try {
    await fn()
    toast.add({ title: okTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleHeadline = async (value: string) =>
  wrap(
    () => updateHeadline(value, { id: professional.value?.id ?? null }),
    'Headline updated',
    'Failed to update headline'
  )

const handleSummary = async (value: string) =>
  wrap(
    () => updateSummary(value, { id: professional.value?.id ?? null }),
    'Summary updated',
    'Failed to update summary'
  )

const handleBio = async (value: string) =>
  wrap(
    () => updateBio(value, { id: professional.value?.id ?? null }),
    'Bio updated',
    'Failed to update bio'
  )

const handleImage = async (value: string) =>
  wrap(
    () => updateImage(value, { id: professional.value?.id ?? null }),
    'Professional image updated',
    'Failed to update professional image'
  )

const handleServiceTypes = async (value: string[]) =>
  wrap(
    () => updateServiceTypes(value, { id: professional.value?.id ?? null }),
    'Service types updated',
    'Failed to update service types'
  )

const handleWorkAreas = async (value: string[]) =>
  wrap(
    () => updateWorkAreasCsv(value, { id: professional.value?.id ?? null }),
    'Work areas updated',
    'Failed to update work areas'
  )
</script>
