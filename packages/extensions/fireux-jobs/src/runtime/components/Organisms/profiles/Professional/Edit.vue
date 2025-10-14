<!-- Professional Edit -->
<template>
  <ClientOnly>
    <template v-if="professional">
      <div class="space-y-8">
        <!-- Relevant Experience -->
        <section class="space-y-4">
          <h3 class="text-base font-semibold">Relevant Experience</h3>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Relevant Experience"
            :items="professional.relevant_experience || []"
            :onSave="onSaveRelevantExperience"
          />
        </section>

        <!-- Other Experience -->
        <section class="space-y-4">
          <h3 class="text-base font-semibold">Other Experience</h3>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Other Experience"
            :items="professional.other_experience || []"
            :onSave="onSaveOtherExperience"
          />
        </section>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessionalUpdate } from '../../../../composables/firestore/profiles/Professional/useProfessionalUpdate'
import type {
  ProfessionalCoreProfile,
  RelevantExperienceItem,
  OtherExperienceItem,
} from '../../../../models/profiles/Professional.model'

const props = defineProps<{
  professional: ProfessionalCoreProfile | null
}>()

const professional = computed(() => props.professional)

const { setRelevantExperience, setOtherExperience } = useProfessionalUpdate()

const onSaveRelevantExperience = (items: RelevantExperienceItem[]) =>
  setRelevantExperience(items)

const onSaveOtherExperience = (items: OtherExperienceItem[]) =>
  setOtherExperience(items)
</script>
