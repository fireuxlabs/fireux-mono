<!-- Professional Edit — basics + legacy kitchen experience -->
<template>
  <ClientOnly>
    <div class="space-y-8">
      <!-- Section 1 — Basics -->
      <section class="space-y-4">
        <h3 class="text-base font-semibold">Section 1 — Basics</h3>
        <div class="space-y-6">
          <MoleculesFormsFirestoreAvatarPicker
            :src="avatar"
            :alt="displayName || 'Professional'"
            :update-function="onSaveAvatar"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Display Name"
            :firebase-value="displayName"
            placeholder="Enter your display name"
            :update-function="onSaveDisplayName"
            :validation-function="validateDisplayName"
            :formatting-function="formatDisplayName"
          />
        </div>
      </section>

      <!-- Section 2 — Experience (neutral) -->
      <section class="space-y-6">
        <h3 class="text-base font-semibold">Section 2 — Experience</h3>

        <UCard>
          <template #header>
            <div class="font-medium">Relevant Experience</div>
          </template>
          <MoleculesFormsObjectArray
            label="Relevant Experience"
            :firebase-value="relevantExperience"
            :update-function="onSaveRelevantExperience"
          >
            <template #display="{ item, index }">
              <OrganismsProfessionalFieldsExperience
                :item="item"
                :index="index"
                mode="display"
              />
            </template>
            <template #edit="{ item, index, remove }">
              <OrganismsProfessionalFieldsExperience
                :item="item"
                :index="index"
                mode="edit"
                :remove="remove"
              />
            </template>
            <template #create="{ push }">
              <OrganismsExperienceQuickAdd @create="push" />
            </template>
          </MoleculesFormsObjectArray>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-medium">Other Experience</div>
          </template>
          <MoleculesFormsObjectArray
            label="Other Experience"
            :firebase-value="otherExperience"
            :update-function="onSaveOtherExperience"
          >
            <template #display="{ item, index }">
              <OrganismsProfessionalFieldsExperience
                :item="item"
                :index="index"
                mode="display"
              />
            </template>
            <template #edit="{ item, index, remove }">
              <OrganismsProfessionalFieldsExperience
                :item="item"
                :index="index"
                mode="edit"
                :remove="remove"
              />
            </template>
            <template #create="{ push }">
              <OrganismsExperienceQuickAdd @create="push" />
            </template>
          </MoleculesFormsObjectArray>
        </UCard>
      </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'
import { computed } from 'vue'

// Generic read
// useProfile is auto-imported by the core module; avoid restricted subpath imports
import { professionalConfig } from '../../../../models/profiles/Professional.model'
// Pure helpers
import { useProfessionalFormattingAndValidation } from '../../../../composables/firestore/profiles/Professional/useProfessionalFormattingAndValidation'

// Explicit component imports for consistent tags regardless of auto-import naming
import OrganismsProfessionalFieldsExperience from './Fields/Experience.vue'
import OrganismsExperienceQuickAdd from './Fields/ExperienceQuickAdd.vue'

const props = defineProps<{ professional: Professional | null | undefined }>()

/** READ: unified profile from core */
const { profile, avatar, displayName } = useProfile(professionalConfig)
const relevantExperience = computed(
  () => profile.value?.relevant_experience ?? []
)
const otherExperience = computed(() => profile.value?.other_experience ?? [])

/** VALIDATE / FORMAT */
const { validateDisplayName, formatDisplayName } =
  useProfessionalFormattingAndValidation()

/** UPDATE: entity-specific updates only */
const {
  setRelevantExperience,
  setOtherExperience,
  updateDisplayName,
  updateAvatar,
} = useProfessionalUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v, 'auto')
const onSaveAvatar = (file: File | Blob) => updateAvatar(file, 'auto')
const onSaveRelevantExperience = (items: any[]) =>
  setRelevantExperience(items, 'auto')
const onSaveOtherExperience = (items: any[]) =>
  setOtherExperience(items, 'auto')
</script>
