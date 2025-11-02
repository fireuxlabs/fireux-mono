<template>
  <ClientOnly>
    <div v-if="record" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <header class="space-y-1">
            <h3 class="text-base font-semibold text-gray-900">
              Relevant Experience
            </h3>
            <p class="text-sm text-gray-500">
              Capture the roles that best represent your expertise.
            </p>
          </header>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Relevant Experience"
            :items="record.relevant_experience || []"
            :onSave="onSaveRelevantExperience"
          />
        </div>
      </UCard>

      <UCard>
        <div class="space-y-4">
          <header class="space-y-1">
            <h3 class="text-base font-semibold text-gray-900">
              Other Experience
            </h3>
            <p class="text-sm text-gray-500">
              Track supporting roles, projects, and contract work.
            </p>
          </header>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Other Experience"
            :items="record.other_experience || []"
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
import { useProfessionalUpdate } from '../../../../composables/firestore/profiles/Professional/main/useProfessionalUpdate'
import type {
  ProfessionalCoreProfile,
  RelevantExperienceItem,
  OtherExperienceItem,
} from '../../../../models/profiles/Professional.model'

const props = defineProps<{
  professional: ProfessionalCoreProfile | null
}>()

const record = computed(() => props.professional)

const { setRelevantExperience, setOtherExperience } = useProfessionalUpdate()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const onSaveRelevantExperience = async (items: RelevantExperienceItem[]) => {
  try {
    await setRelevantExperience(items)
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
    await setOtherExperience(items)
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
