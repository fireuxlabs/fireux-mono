<template>
  <ClientOnly>
    <div v-if="professional" class="space-y-6">
      <UCard>
        <MoleculesFormsFirestoreSimpleField
          label="Title"
          :firebase-value="title"
          placeholder="Ex: Freelancer, Agent, Developer"
          :update-function="onUpdateTitle"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Short Bio"
          type="textarea"
          :rows="3"
          :maxlength="200"
          :firebase-value="bioShort"
          placeholder="Share a quick intro for listings"
          :update-function="onUpdateBioShort"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Long Bio"
          type="textarea"
          :rows="6"
          :maxlength="2000"
          :firebase-value="bioLong"
          placeholder="Add the full professional bio"
          :update-function="onUpdateBioLong"
        />
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreArrayOfStrings
          label="Specialties"
          :firebase-value="specialties"
          item-placeholder="Specialty"
          new-item-placeholder="Add specialty"
          :update-function="onUpdateSpecialties"
        />

        <MoleculesFormsFirestoreArrayOfStrings
          label="Locations"
          :firebase-value="locations"
          item-placeholder="Location"
          new-item-placeholder="Add location"
          :update-function="onUpdateLocations"
        />

        <MoleculesFormsFirestoreArrayOfStrings
          label="Health Certifications"
          :firebase-value="healthCertifications"
          item-placeholder="Certification"
          new-item-placeholder="Add certification"
          :update-function="onUpdateHealthCertifications"
        />
      </UCard>

      <OrganismsProfilesProfessionalFieldsExperienceSection
        label="Relevant Experience"
        :items="professional.relevant_experience || []"
        :onSave="onSaveRelevantExperience"
      />

      <OrganismsProfilesProfessionalFieldsExperienceSection
        label="Other Experience"
        :items="professional.other_experience || []"
        :onSave="onSaveOtherExperience"
      />

      <UCard>
        <MoleculesFormsFirestoreObjectArray
          label="Languages"
          :firebase-value="languages"
          :update-function="onUpdateLanguages"
        >
          <template #display="{ item, startEditing, remove }">
            <div class="space-y-2">
              <div class="text-sm font-medium">
                {{ item.language || 'Language' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ item.proficiency || 'Proficiency not set' }}
              </div>
              <div class="flex gap-2">
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-pencil"
                  @click="startEditing"
                >
                  Edit
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="remove"
                >
                  Remove
                </UButton>
              </div>
            </div>
          </template>
          <template #edit="{ item, save, cancel }">
            <div class="space-y-2">
              <UInput v-model="item.language" placeholder="Language" />
              <UInput v-model="item.proficiency" placeholder="Proficiency" />
              <div class="flex gap-2">
                <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save">
                  Save
                </UButton>
                <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
                  Cancel
                </UButton>
              </div>
            </div>
          </template>
          <template #create="{ push }">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-plus"
              @click="push({ language: '', proficiency: '' })"
            >
              Add language
            </UButton>
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreObjectArray
          label="Certifications"
          :firebase-value="certifications"
          :update-function="onUpdateCertifications"
        >
          <template #display="{ item, startEditing, remove }">
            <div class="space-y-2">
              <div class="text-sm font-medium">{{ item.name || 'Certification' }}</div>
              <div class="text-xs text-gray-500">
                {{ item.place_name || 'Organization' }} · {{ item.year || 'Year not set' }}
              </div>
              <div class="flex gap-2">
                <UButton size="xs" variant="soft" icon="i-lucide-pencil" @click="startEditing">
                  Edit
                </UButton>
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove">
                  Remove
                </UButton>
              </div>
            </div>
          </template>
          <template #edit="{ item, save, cancel }">
            <div class="space-y-2">
              <UInput v-model="item.name" placeholder="Certification name" />
              <UInput v-model="item.place_name" placeholder="Organization" />
              <UInput v-model="item.year" placeholder="Year" />
              <UInput v-model="item.formatted_address" placeholder="Address" />
              <UInput v-model="item.document_url" placeholder="Document URL" />
              <UInput v-model="item.image_url" placeholder="Image URL" />
              <div class="flex gap-2">
                <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save">
                  Save
                </UButton>
                <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
                  Cancel
                </UButton>
              </div>
            </div>
          </template>
          <template #create="{ push }">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-plus"
              @click="push({
                name: '',
                year: '',
                place_name: '',
                formatted_address: '',
                document_url: '',
                image_url: '',
              })"
            >
              Add certification
            </UButton>
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreObjectArray
          label="Education"
          :firebase-value="education"
          :update-function="onUpdateEducation"
        >
          <template #display="{ item, startEditing, remove }">
            <div class="space-y-2">
              <div class="text-sm font-medium">{{ item.degree || 'Degree' }}</div>
              <div class="text-xs text-gray-500">
                {{ item.institution || 'Institution' }} · {{ item.start_year || 'Start' }}–{{ item.ongoing ? 'Present' : (item.end_year || 'End') }}
              </div>
              <div class="flex gap-2">
                <UButton size="xs" variant="soft" icon="i-lucide-pencil" @click="startEditing">
                  Edit
                </UButton>
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove">
                  Remove
                </UButton>
              </div>
            </div>
          </template>
          <template #edit="{ item, save, cancel }">
            <div class="space-y-2">
              <UInput v-model="item.institution" placeholder="Institution" />
              <UInput v-model="item.degree" placeholder="Degree" />
              <UInput v-model="item.start_year" placeholder="Start year" />
              <UInput v-model="item.end_year" placeholder="End year" />
              <UCheckbox v-model="item.ongoing" label="Ongoing" />
              <UInput v-model="item.formatted_address" placeholder="Address" />
              <UInput v-model="item.document_url" placeholder="Document URL" />
              <UInput v-model="item.image_url" placeholder="Image URL" />
              <div class="flex gap-2">
                <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save">
                  Save
                </UButton>
                <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
                  Cancel
                </UButton>
              </div>
            </div>
          </template>
          <template #create="{ push }">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-plus"
              @click="push({
                institution: '',
                degree: '',
                start_year: '',
                end_year: '',
                ongoing: false,
                formatted_address: '',
                document_url: '',
                image_url: '',
              })"
            >
              Add education
            </UButton>
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreObjectArray
          label="Volunteering"
          :firebase-value="volunteering"
          :update-function="onUpdateVolunteering"
        >
          <template #display="{ item, startEditing, remove }">
            <div class="space-y-2">
              <div class="text-sm font-medium">{{ item.organization || 'Organization' }}</div>
              <div class="text-xs text-gray-500">
                {{ item.role || 'Role' }} · {{ item.from_year || 'Start' }}–{{ item.ongoing ? 'Present' : (item.to_year || 'End') }}
              </div>
              <div class="flex gap-2">
                <UButton size="xs" variant="soft" icon="i-lucide-pencil" @click="startEditing">
                  Edit
                </UButton>
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove">
                  Remove
                </UButton>
              </div>
            </div>
          </template>
          <template #edit="{ item, save, cancel }">
            <div class="space-y-2">
              <UInput v-model="item.organization" placeholder="Organization" />
              <UInput v-model="item.role" placeholder="Role" />
              <UInput v-model="item.from_year" placeholder="Start year" />
              <UInput v-model="item.to_year" placeholder="End year" />
              <UCheckbox v-model="item.ongoing" label="Ongoing" />
              <UTextarea v-model="item.responsibilities" :rows="3" placeholder="Responsibilities" />
              <div class="flex gap-2">
                <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save">
                  Save
                </UButton>
                <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
                  Cancel
                </UButton>
              </div>
            </div>
          </template>
          <template #create="{ push }">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-plus"
              @click="push({
                organization: '',
                role: '',
                from_year: '',
                to_year: '',
                ongoing: false,
                responsibilities: '',
              })"
            >
              Add volunteering
            </UButton>
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </UCard>

      <UCard>
        <MoleculesFormsFirestoreObjectArray
          label="Projects"
          :firebase-value="projects"
          :update-function="onUpdateProjects"
        >
          <template #display="{ item, startEditing, remove }">
            <div class="space-y-2">
              <div class="text-sm font-medium">{{ item.name || 'Project' }}</div>
              <div class="text-xs text-gray-500">
                {{ item.role || 'Role' }} · {{ item.from_year || 'Start' }}–{{ item.ongoing ? 'Present' : (item.to_year || 'End') }}
              </div>
              <div class="flex gap-2">
                <UButton size="xs" variant="soft" icon="i-lucide-pencil" @click="startEditing">
                  Edit
                </UButton>
                <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="remove">
                  Remove
                </UButton>
              </div>
            </div>
          </template>
          <template #edit="{ item, save, cancel }">
            <div class="space-y-2">
              <UInput v-model="item.name" placeholder="Project name" />
              <UInput v-model="item.role" placeholder="Role" />
              <UInput v-model="item.from_year" placeholder="Start year" />
              <UInput v-model="item.to_year" placeholder="End year" />
              <UCheckbox v-model="item.ongoing" label="Ongoing" />
              <UTextarea v-model="item.responsibilities" :rows="3" placeholder="Responsibilities" />
              <div class="flex gap-2">
                <UButton size="xs" variant="solid" icon="i-lucide-check" @click="save">
                  Save
                </UButton>
                <UButton size="xs" variant="soft" icon="i-lucide-x" @click="cancel">
                  Cancel
                </UButton>
              </div>
            </div>
          </template>
          <template #create="{ push }">
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-plus"
              @click="push({
                name: '',
                role: '',
                from_year: '',
                to_year: '',
                ongoing: false,
                responsibilities: '',
              })"
            >
              Add project
            </UButton>
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="professional profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from '#imports';
import { useProfessionalUpdate } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalUpdate.ts';
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model.ts';
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from '../../../../../models/profiles/Professional/supporting';

const props = defineProps<{
  professional: ProfessionalCore | null
}>()

const {
  setRelevantExperience,
  setOtherExperience,
  updateTitle,
  updateBioShort,
  updateBioLong,
  updateSpecialties,
  updateLocations,
  updateHealthCertifications,
  updateLanguages,
  updateCertifications,
  updateEducation,
  updateVolunteering,
  updateProjects,
} = useProfessionalUpdate()

const title = computed(() => props.professional?.title ?? '')
const bioShort = computed(() => props.professional?.bio_short ?? '')
const bioLong = computed(() => props.professional?.bio_long ?? '')
const specialties = computed(() => props.professional?.specialties ?? [])
const locations = computed(() => props.professional?.locations ?? [])
const healthCertifications = computed(() => props.professional?.health_certifications ?? [])
const languages = computed(() => props.professional?.languages ?? [])
const certifications = computed(() => props.professional?.certifications ?? [])
const education = computed(() => props.professional?.education ?? [])
const volunteering = computed(() => props.professional?.volunteering ?? [])
const projects = computed(() => props.professional?.projects ?? [])

const onUpdateTitle = async (value: string) => {
  try {
    await updateTitle(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Title updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update title',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateBioShort = async (value: string) => {
  try {
    await updateBioShort(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Short bio updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update short bio',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateBioLong = async (value: string) => {
  try {
    await updateBioLong(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Long bio updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update long bio',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateSpecialties = async (value: string[]) => {
  try {
    await updateSpecialties(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Specialties updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update specialties',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateLocations = async (value: string[]) => {
  try {
    await updateLocations(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Locations updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update locations',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateHealthCertifications = async (value: string[]) => {
  try {
    await updateHealthCertifications(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Health certifications updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update health certifications',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateLanguages = async (value: LanguageProficiency[]) => {
  try {
    await updateLanguages(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Languages updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update languages',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateCertifications = async (value: CertificationItem[]) => {
  try {
    await updateCertifications(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Certifications updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update certifications',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateEducation = async (value: EducationItem[]) => {
  try {
    await updateEducation(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Education updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update education',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateVolunteering = async (value: VolunteeringItem[]) => {
  try {
    await updateVolunteering(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Volunteering updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update volunteering',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onUpdateProjects = async (value: ProjectItem[]) => {
  try {
    await updateProjects(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Projects updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update projects',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const onSaveRelevantExperience = async (items: RelevantExperienceItem[]) => {
  try {
    await setRelevantExperience(items, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Relevant experience updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update experience',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const onSaveOtherExperience = async (items: OtherExperienceItem[]) => {
  try {
    await setOtherExperience(items, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Other experience updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update experience',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

</script>
