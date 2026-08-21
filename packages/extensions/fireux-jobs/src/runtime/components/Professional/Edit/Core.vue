<!-- Concurrent edit — 2026-07-20 19:20 CEST — Repo Efficiency Pass 2 of 6: bind self-profile updates and enforce Professional collection capacities. -->
<!-- Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: use Nuxt UI card structure and local form rhythm. -->
<template>
  <ClientOnly>
    <div v-if="professional" class="space-y-6">
      <UPageCard
        title="Identity"
        icon="i-lucide-id-card"
        variant="outline"
      >
        <div class="space-y-4">
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

          <div class="flex flex-col items-center gap-2">
            <MoleculesFormsFirestoreImagePicker
              :src="imageUrl"
              :alt="headline || 'Professional'"
              :initials="imageInitials"
              :update-function="handleImageUpload"
            />
            <p v-if="imageUploading" class="text-xs text-muted">
              Uploading image…
            </p>
          </div>

          <MoleculesFormsFirestoreArrayOfStrings
            label="Positions"
            :firebase-value="positions"
            item-placeholder="Position"
            new-item-placeholder="Add position"
            :update-function="handlePositions"
            :max-items="ProfessionalConstraints.positions"
            :max-length="ProfessionalConstraints.stringItemLength"
          />
        </div>
      </UPageCard>

      <ProfessionalFieldsExperienceSection
        :label="relevantExperienceLabel"
        :items="professional.relevant_experience || []"
        :onSave="handleRelevantExperience"
        :place-collections="placeCollections"
        :max-items="relevantExperienceMaxItems"
      />

      <ProfessionalFieldsExperienceSection
        label="Other Experience"
        :items="professional.other_experience || []"
        :onSave="handleOtherExperience"
        :max-items="otherExperienceMaxItems"
      />

      <ProfessionalEditSectionsLanguages
        :items="languages"
        :onSave="handleLanguages"
        :max-items="languagesMaxItems"
      />

      <ProfessionalEditSectionsCertifications
        :items="certifications"
        :onSave="handleCertifications"
        :max-items="certificationsMaxItems"
      />

      <ProfessionalEditSectionsEducation
        :items="education"
        :onSave="handleEducation"
        :max-items="educationMaxItems"
      />

      <ProfessionalEditSectionsVolunteering
        :items="volunteering"
        :onSave="handleVolunteering"
        :max-items="volunteeringMaxItems"
      />

      <ProfessionalEditSectionsProjects
        :items="projects"
        :onSave="handleProjects"
        :max-items="projectsMaxItems"
      />
    </div>

    <MoleculesStateCard v-else entity="professional profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useJobsConfig } from '../../../composables/fireux/app/useJobsConfig'
import { useProfessional } from '../../../composables/fireux/firestore/profiles/Professional/useProfessional'
import {
  ProfessionalConstraints,
  type CertificationItem,
  type EducationItem,
  type LanguageProficiency,
  type OtherExperienceItem,
  type ProjectItem,
  type RelevantExperienceItem,
  type VolunteeringItem,
} from '../../../models/profiles/Professional/Professional.model'

const toast = useToastify()
const {
  professionalProfile,
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
} = useProfessional()

const { placeCollections } = useJobsConfig()
const relevantExperienceLabel = computed(() => 'Relevant Experience')

const professional = computed(() => professionalProfile.value ?? null)

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

type StructuredField =
  | 'relevant_experience'
  | 'other_experience'
  | 'languages'
  | 'certifications'
  | 'education'
  | 'volunteering'
  | 'projects'

const structuredFields: StructuredField[] = [
  'relevant_experience',
  'other_experience',
  'languages',
  'certifications',
  'education',
  'volunteering',
  'projects',
]

const structuredMaxItems = (
  field: StructuredField,
  perListLimit: number
) =>
  computed(() => {
    const value = professional.value
    const otherItems = structuredFields.reduce(
      (total, key) =>
        key === field ? total : total + (value?.[key].length ?? 0),
      0
    )
    return Math.max(
      0,
      Math.min(
        perListLimit,
        ProfessionalConstraints.structuredTotal - otherItems
      )
    )
  })

const relevantExperienceMaxItems = structuredMaxItems(
  'relevant_experience',
  ProfessionalConstraints.relevantExperience
)
const otherExperienceMaxItems = structuredMaxItems(
  'other_experience',
  ProfessionalConstraints.otherExperience
)
const languagesMaxItems = structuredMaxItems(
  'languages',
  ProfessionalConstraints.languages
)
const certificationsMaxItems = structuredMaxItems(
  'certifications',
  ProfessionalConstraints.certifications
)
const educationMaxItems = structuredMaxItems(
  'education',
  ProfessionalConstraints.education
)
const volunteeringMaxItems = structuredMaxItems(
  'volunteering',
  ProfessionalConstraints.volunteering
)
const projectsMaxItems = structuredMaxItems(
  'projects',
  ProfessionalConstraints.projects
)

const wrap = async (fn: () => Promise<void>, failTitle: string) => {
  try {
    await fn()
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'warning',
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
      color: 'warning',
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
