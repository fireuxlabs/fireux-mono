<!-- Professional Edit -->
<template>
  <ClientOnly>
    <template v-if="professional">
      <div class="space-y-8">
        <!-- Section 1 — Basics (collapsed by default) -->
        <section>
          <details>
            <summary class="cursor-pointer select-none text-base font-semibold">
              Section 1 — Basics
            </summary>
            <div class="mt-4 space-y-6">
              <MoleculesFormsFirestoreAvatarPicker
                :src="professional?.avatar"
                :alt="professional?.display_name || 'Professional'"
                :update-function="onSaveAvatar"
              />

              <MoleculesFormsFirestoreSimpleField
                label="Display Name"
                :firebase-value="professional?.display_name"
                placeholder="Enter your display name"
                :update-function="onSaveDisplayName"
                :validation-function="validateDisplayName"
                :formatting-function="formatDisplayName"
              />
            </div>
          </details>
        </section>

        <!-- Relevant Experience -->
        <section class="space-y-4">
          <h3 class="text-base font-semibold">Relevant Experience</h3>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Relevant Experience"
            :items="professional?.relevant_experience || []"
            :onSave="onSaveRelevantExperience"
          />
        </section>

        <!-- Other Experience -->
        <section class="space-y-4">
          <h3 class="text-base font-semibold">Other Experience</h3>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Other Experience"
            :items="professional?.other_experience || []"
            :onSave="onSaveOtherExperience"
          />
        </section>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useProfessionalFormattingAndValidation } from '../../../../composables/firestore/profiles/Professional/useProfessionalFormattingAndValidation'
import { useProfessionalUpdate } from '../../../../composables/firestore/profiles/Professional/useProfessionalUpdate'

const props = defineProps<{ professional: any }>()

watch(
  () => props.professional,
  (value) => {
    // eslint-disable-next-line no-console
    console.debug('[jobs][Professional/Edit] professional payload', {
      hasProfile: !!value,
      keys: value ? Object.keys(value) : [],
    })
  },
  { immediate: true }
)
/** VALIDATE / FORMAT */
const { validateDisplayName, formatDisplayName } =
  useProfessionalFormattingAndValidation()

/** UPDATE */
const {
  updateDisplayName,
  updateAvatar,
  setRelevantExperience,
  setOtherExperience,
} = useProfessionalUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v, 'auto')
const onSaveAvatar = (file: File | Blob) => updateAvatar(file, 'auto')
const onSaveRelevantExperience = (items: any[]) => {
  // eslint-disable-next-line no-console
  console.debug('[jobs][Professional/Edit] saving relevant experience', {
    count: items.length,
  })
  return setRelevantExperience(items, 'auto')
}
const onSaveOtherExperience = (items: any[]) => {
  // eslint-disable-next-line no-console
  console.debug('[jobs][Professional/Edit] saving other experience', {
    count: items.length,
  })
  return setOtherExperience(items, 'auto')
}

// Items now referenced directly in template
</script>
