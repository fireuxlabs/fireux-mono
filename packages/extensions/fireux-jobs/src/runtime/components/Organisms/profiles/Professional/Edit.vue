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

        <!-- Section 2 — Experience (two subsections, reusable) -->
        <section class="space-y-6">
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Relevant Experience"
            :items="professional?.relevant_experience || []"
            :onSave="onSaveRelevantExperience"
          />

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
defineProps<{ professional: any }>()
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
const onSaveRelevantExperience = (items: any[]) =>
  setRelevantExperience(items, 'auto')
const onSaveOtherExperience = (items: any[]) =>
  setOtherExperience(items, 'auto')

// Items now referenced directly in template
</script>
