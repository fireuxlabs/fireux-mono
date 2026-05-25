<template>
  <ClientOnly>
    <div v-if="professional" class="profile-edit">
      <UCard>
        <template #header>
          <div class="profile-edit__section-header">
            <UIcon name="i-lucide-id-card" />
            Identity
          </div>
        </template>

        <div class="profile-edit__fields">
          <MoleculesFormsFirestoreSimpleField
            label="Job title"
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

          <div class="profile-edit__field">
            <div class="flex flex-col items-center gap-2">
              <MoleculesFormsFirestoreImagePicker
                :src="imageUrl"
                :alt="headline || 'Professional'"
                :initials="imageInitials"
                :update-function="handleImageUpload"
              />
              <p v-if="imageUploading" class="text-xs text-gray-500">
                Uploading image…
              </p>
            </div>
          </div>

          <div class="profile-edit__field">
            <MoleculesFormsFirestoreArrayOfStrings
              label="Positions"
              :firebase-value="positions"
              item-placeholder="Position"
              new-item-placeholder="Add position"
              :update-function="handlePositions"
            />
          </div>
        </div>
      </UCard>

      <ProfessionalFieldsExperienceSection
        :label="relevantExperienceLabel"
        :items="professional.relevant_experience || []"
        :onSave="handleRelevantExperience"
        :place-type="relevantPlaceType"
        :place-collections="placeCollections"
      />

      <ProfessionalFieldsExperienceSection
        label="Other Experience"
        :items="professional.other_experience || []"
        :onSave="handleOtherExperience"
      />

      <ProfessionalEditSectionsLanguages
        :items="languages"
        :onSave="handleLanguages"
      />

      <ProfessionalEditSectionsCertifications
        :items="certifications"
        :onSave="handleCertifications"
      />

      <ProfessionalEditSectionsEducation
        :items="education"
        :onSave="handleEducation"
      />

      <ProfessionalEditSectionsVolunteering
        :items="volunteering"
        :onSave="handleVolunteering"
      />

      <ProfessionalEditSectionsProjects
        :items="projects"
        :onSave="handleProjects"
      />
    </div>

    <MoleculesStateCard v-else entity="professional profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useJobsConfig } from '../../../../composables/fireux/app/useJobsConfig'
import { useProfessionalUpdate } from '../../../../composables/fireux/firestore/profiles/Professional/mutations/useProfessionalUpdate'
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional'
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from '../../../../models/profiles/Professional/Professional.model'

const toast = useToastify()
const { coreProfile } = useProfessional()

const {
  updateTitle,
  updateSummary,
  updateBio,
  uploadProfileImage,
  updatePositions,
  setRelevantExperience,
  setOtherExperience,
  updateLanguages,
  updateCertifications,
  updateEducation,
  updateVolunteering,
  updateProjects,
} = useProfessionalUpdate()

const { placeCollections } = useJobsConfig()
const relevantPlaceType = computed(() => placeCollections[0] ?? null)
const relevantExperienceLabel = computed(() => 'Relevant Experience')

const professional = computed(() => coreProfile.value ?? null)

const headline = computed(() => professional.value?.title ?? '')
const summary = computed(() => professional.value?.summary ?? '')
const bio = computed(() => professional.value?.bio ?? '')
const imageUrl = computed(() => professional.value?.image ?? '')
const imageInitials = computed(() => {
  const text = String(headline.value ?? '').trim()
  if (!text) return 'P'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
const positions = computed(() => professional.value?.positions ?? [])

const languages = computed(() => professional.value?.languages ?? [])
const certifications = computed(() => professional.value?.certifications ?? [])
const education = computed(() => professional.value?.education ?? [])
const volunteering = computed(() => professional.value?.volunteering ?? [])
const projects = computed(() => professional.value?.projects ?? [])

const wrap = async (fn: () => Promise<void>, failTitle: string) => {
  try {
    await fn()
    return 'success'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'amber',
    })
    throw error
  }
}

const handleHeadline = async (value: string) =>
  wrap(
    () => updateTitle(value, { id: professional.value?.id ?? null }),
    'Failed to update title'
  )

const handleSummary = async (value: string) =>
  wrap(
    () => updateSummary(value, { id: professional.value?.id ?? null }),
    'Failed to update summary'
  )

const handleBio = async (value: string) =>
  wrap(
    () => updateBio(value, { id: professional.value?.id ?? null }),
    'Failed to update bio'
  )

const imageUploading = ref(false)
const handleImageUpload = async (file: File) => {
  imageUploading.value = true
  try {
    await uploadProfileImage(file, { id: professional.value?.id ?? null })
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: 'Failed to update image',
      description,
      color: 'amber',
    })
    throw error
  } finally {
    imageUploading.value = false
  }
}

const handlePositions = async (value: string[]) =>
  wrap(
    () => updatePositions(value, { id: professional.value?.id ?? null }),
    'Failed to update positions'
  )

const handleLanguages = async (value: LanguageProficiency[]) =>
  wrap(
    () => updateLanguages(value, { id: professional.value?.id ?? null }),
    'Failed to update languages'
  )

const handleCertifications = async (value: CertificationItem[]) =>
  wrap(
    () => updateCertifications(value, { id: professional.value?.id ?? null }),
    'Failed to update certifications'
  )

const handleEducation = async (value: EducationItem[]) =>
  wrap(
    () => updateEducation(value, { id: professional.value?.id ?? null }),
    'Failed to update education'
  )

const handleVolunteering = async (value: VolunteeringItem[]) =>
  wrap(
    () => updateVolunteering(value, { id: professional.value?.id ?? null }),
    'Failed to update volunteering'
  )

const handleProjects = async (value: ProjectItem[]) =>
  wrap(
    () => updateProjects(value, { id: professional.value?.id ?? null }),
    'Failed to update projects'
  )

const handleRelevantExperience = async (items: RelevantExperienceItem[]) =>
  wrap(
    () => setRelevantExperience(items, { id: professional.value?.id ?? null }),
    'Failed to update relevant experience'
  )

const handleOtherExperience = async (items: OtherExperienceItem[]) =>
  wrap(
    () => setOtherExperience(items, { id: professional.value?.id ?? null }),
    'Failed to update other experience'
  )
</script>
