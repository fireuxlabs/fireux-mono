<template>
  <ClientOnly>
    <div v-if="professional" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Tagline"
            :firebase-value="tagline"
            placeholder="Ex: Private chef, pastry specialist"
            :update-function="onUpdateTagline"
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
        </div>
      </UCard>

      <UCard>
        <div>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Relevant Experience"
            :items="professional.relevant_experience || []"
            :onSave="onSaveRelevantExperience"
          />
        </div>
      </UCard>

      <UCard>
        <div>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Other Experience"
            :items="professional.other_experience || []"
            :onSave="onSaveOtherExperience"
          />
        </div>
      </UCard>
    </div>

    <MoleculesNotFound
      v-else
      entity="professional profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessionalUpdate } from '../../../../../composables/firestore/profiles/Professional/main/useProfessionalUpdate.ts'
import type {
  ProfessionalCoreProfile,
  RelevantExperienceItem,
  OtherExperienceItem,
} from '../../../../../models/profiles/Professional.model.ts'

const props = defineProps<{
  professional: ProfessionalCoreProfile | null
}>()

const {
  setRelevantExperience,
  setOtherExperience,
  updateTagline,
  updateBioShort,
} = useProfessionalUpdate()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const tagline = computed(
  () =>
    props.professional?.tagline ??
    (props.professional as { subtitle?: string | null } | null)?.subtitle ??
    ''
)

const bioShort = computed(() => props.professional?.bio_short ?? '')

const onUpdateTagline = async (value: string) => {
  try {
    await updateTagline(value, { id: props.professional?.id ?? null })
    toast?.add({
      title: 'Tagline updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update tagline',
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
