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

          <MoleculesFormsFirestoreSimpleField
            label="Professional Image URL"
            :firebase-value="imageUrl"
            placeholder="Optional: image URL for this professional profile"
            :maxlength="400"
            :update-function="handleImage"
          />

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

      <OrganismsProfilesProfessionalFieldsExperienceSection
        :label="relevantExperienceLabel"
        :items="professional.relevant_experience || []"
        :onSave="handleRelevantExperience"
        :place-type="relevantPlaceType"
        :place-collections="placeCollections"
      />

      <OrganismsProfilesProfessionalFieldsExperienceSection
        label="Other Experience"
        :items="professional.other_experience || []"
        :onSave="handleOtherExperience"
      />

      <OrganismsProfilesProfessionalEditSectionsLanguages
        :items="languages"
        :onSave="handleLanguages"
      />

      <OrganismsProfilesProfessionalEditSectionsCertifications
        :items="certifications"
        :onSave="handleCertifications"
      />

      <OrganismsProfilesProfessionalEditSectionsEducation
        :items="education"
        :onSave="handleEducation"
      />

      <OrganismsProfilesProfessionalEditSectionsVolunteering
        :items="volunteering"
        :onSave="handleVolunteering"
      />

      <OrganismsProfilesProfessionalEditSectionsProjects
        :items="projects"
        :onSave="handleProjects"
      />
    </div>

    <MoleculesStateCard v-else entity="professional profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useJobsConfig } from '../../../../../composables/fireux/app/useJobsConfig'
import { useProfessionalUpdate } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalUpdate'
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model'
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from '../../../../../models/profiles/Professional/supporting'

const props = defineProps<{ professional: ProfessionalCore | null }>()

const toast = useToastify()

const {
  updateJobTitle,
  updateSummary,
  updateBio,
  updateImage,
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
const relevantExperienceLabel = computed(() => {
  const collections = Array.isArray(placeCollections) ? placeCollections : []
  if (!collections.length) return 'Relevant Experience'

  const labels = collections.map((value) => {
    const collection = String(value ?? '').trim()
    if (!collection) return ''
    const base = collection.endsWith('s') ? collection.slice(0, -1) : collection
    return base.charAt(0).toUpperCase() + base.slice(1)
  }).filter(Boolean)

  if (!labels.length) return 'Relevant Experience'
  const prefix = labels.length === 1 ? labels[0] : labels.join(' / ')
  return `${prefix} Experience`
})

const professional = computed(() => props.professional ?? null)

const headline = computed(() => professional.value?.job_title ?? '')
const summary = computed(() => professional.value?.summary ?? '')
const bio = computed(() => professional.value?.bio ?? '')
const imageUrl = computed(() => professional.value?.image ?? '')
const positions = computed(() => professional.value?.positions ?? [])

const languages = computed(() => professional.value?.languages ?? [])
const certifications = computed(() => professional.value?.certifications ?? [])
const education = computed(() => professional.value?.education ?? [])
const volunteering = computed(() => professional.value?.volunteering ?? [])
const projects = computed(() => professional.value?.projects ?? [])

const wrap = async (fn: () => Promise<void>, okTitle: string, failTitle: string) => {
  try {
    await fn()
    toast.add({ title: okTitle })
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
    () => updateJobTitle(value, { id: professional.value?.id ?? null }),
    'Job title updated',
    'Failed to update job title'
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
    'Image updated',
    'Failed to update image'
  )

const handlePositions = async (value: string[]) =>
  wrap(
    () => updatePositions(value, { id: professional.value?.id ?? null }),
    'Positions updated',
    'Failed to update positions'
  )

const handleLanguages = async (value: LanguageProficiency[]) =>
  wrap(
    () => updateLanguages(value, { id: professional.value?.id ?? null }),
    'Languages updated',
    'Failed to update languages'
  )

const handleCertifications = async (value: CertificationItem[]) =>
  wrap(
    () => updateCertifications(value, { id: professional.value?.id ?? null }),
    'Certifications updated',
    'Failed to update certifications'
  )

const handleEducation = async (value: EducationItem[]) =>
  wrap(
    () => updateEducation(value, { id: professional.value?.id ?? null }),
    'Education updated',
    'Failed to update education'
  )

const handleVolunteering = async (value: VolunteeringItem[]) =>
  wrap(
    () => updateVolunteering(value, { id: professional.value?.id ?? null }),
    'Volunteering updated',
    'Failed to update volunteering'
  )

const handleProjects = async (value: ProjectItem[]) =>
  wrap(
    () => updateProjects(value, { id: professional.value?.id ?? null }),
    'Projects updated',
    'Failed to update projects'
  )

const handleRelevantExperience = async (items: RelevantExperienceItem[]) =>
  wrap(
    () => setRelevantExperience(items, { id: professional.value?.id ?? null }),
    'Relevant experience updated',
    'Failed to update relevant experience'
  )

const handleOtherExperience = async (items: OtherExperienceItem[]) =>
  wrap(
    () => setOtherExperience(items, { id: professional.value?.id ?? null }),
    'Other experience updated',
    'Failed to update other experience'
  )
</script>
