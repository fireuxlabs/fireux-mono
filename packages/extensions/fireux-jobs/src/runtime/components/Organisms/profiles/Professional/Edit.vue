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

      <!-- Section 2 — Kitchen Experience -->
      <section class="space-y-4">
        <h3 class="text-base font-semibold">Section 2 — Kitchen Experience</h3>

        <!-- Legacy ObjectArray -->
        <MoleculesFormsObjectArray
          label="Kitchen Experience"
          :firebaseValue="kitchenExperience"
          :updateFunction="onSaveKitchenExperience"
        >
          <template #display="{ item, index }">
            <OrganismsProfessionalFieldsKitchenExperience
              :kitchenExperience="item"
              :index="index"
              mode="display"
            />
          </template>

          <template #edit="{ item, index }">
            <OrganismsProfessionalFieldsKitchenExperience
              :kitchenExperience="item"
              :index="index"
              mode="edit"
            />
          </template>

          <template #create="{ push }">
            <OrganismsKitchenSearchWizard @create="push" />
          </template>
        </MoleculesFormsObjectArray>
      </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'
import { computed } from 'vue'

// Facade (updates, entity extras)
import { useProfessional } from '../../../../composables/firestore/profiles/Professional/useProfessional'
// Read-only computed (avatar/displayName, etc.)
import { useProfessionalComputed } from '../../../../composables/firestore/profiles/Professional/useProfessionalComputed'
// Pure helpers
import { useProfessionalFormattingAndValidation } from '../../../../composables/firestore/profiles/Professional/useProfessionalFormattingAndValidation'

// Explicit component imports for consistent tags regardless of auto-import naming
import OrganismsProfessionalFieldsKitchenExperience from './Fields/KitchenExperience.vue'
import OrganismsKitchenSearchWizard from './Fields/KitchenSearchWizard.vue'

const props = defineProps<{ professional: Professional | null | undefined }>()

/** READ: keep read concerns separate */
const { avatar, displayName } = useProfessionalComputed(props.professional)
// expose array via computed so template isn't reaching into props directly
const kitchenExperience = computed(
  () => props.professional?.kitchen_experience ?? []
)

/** VALIDATE / FORMAT */
const { validateDisplayName, formatDisplayName } =
  useProfessionalFormattingAndValidation()

/** UPDATE: delta-first via facade helpers */
const { updateDisplayName, updateAvatar, updateKitchenExperience } =
  useProfessional(props.professional)

const onSaveDisplayName = (v: string) => updateDisplayName(v, 'auto')
const onSaveAvatar = (file: File | Blob) => updateAvatar(file, 'auto')
const onSaveKitchenExperience = (items: any[]) =>
  updateKitchenExperience(items, 'auto')
</script>
