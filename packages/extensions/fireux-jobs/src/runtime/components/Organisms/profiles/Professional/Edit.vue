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
          :firebaseValue="props.professional?.kitchen_experience"
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

          <!-- Create doesn't need index -->
          <template #create>
            <OrganismsKitchenSearchWizard />
          </template>
        </MoleculesFormsObjectArray>
      </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'
import { useProfessional } from '../../../../composables/firestore/profiles/Professional/useProfessional'
import { useProfessionalComputed } from '../../../../composables/firestore/profiles/Professional/useProfessionalComputed'
import { useProfessionalFormattingAndValidation } from '../../../../composables/firestore/profiles/Professional/useProfessionalFormattingAndValidation'

const props = defineProps<{ professional: Professional | null | undefined }>()

const { avatar, displayName } = useProfessionalComputed(props.professional)
const { validateDisplayName, formatDisplayName } =
  useProfessionalFormattingAndValidation()
const { updateDisplayName, updateAvatar } = useProfessional(props.professional)

const onSaveDisplayName = (v: string) => updateDisplayName(v, 'auto')
const onSaveAvatar = (file: File) => updateAvatar(file, 'auto')
</script>
