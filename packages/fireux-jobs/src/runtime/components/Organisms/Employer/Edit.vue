<template>
  <client-only>
    <UContainer v-if="employer" class="edit-component">
      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="section-title">Edit Company Information</h3>
        <UButton
          :icon="
            isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          variant="ghost"
          size="sm"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Hide' : 'Edit' }}
        </UButton>
      </div>

      <!-- Company Information Section -->
      <div v-show="isExpanded" class="info-section">
        <div class="fields-container">
          <!-- Single Fields -->
          <FireMoleculesFormsFirestoreSingleField
            label="Company Name"
            :firebase-value="employer.companyName"
            placeholder="Enter your company name"
            :update-function="
              (newValue) => saveField('Company Name', 'companyName', newValue)
            "
          />
          <FireMoleculesFormsFirestoreSingleField
            label="Contact Email"
            :firebase-value="employer.contactEmail"
            placeholder="Enter contact email"
            :update-function="
              (newValue) => saveField('Contact Email', 'contactEmail', newValue)
            "
          />
          <FireMoleculesFormsFirestoreSingleField
            label="Website"
            :firebase-value="employer.website || ''"
            placeholder="Enter company website"
            :update-function="
              (newValue) => saveField('Website', 'website', newValue)
            "
          />
          <FireMoleculesFormsFirestoreSingleField
            label="Description"
            :firebase-value="employer.description || ''"
            placeholder="Describe your company"
            :update-function="
              (newValue) => saveField('Description', 'description', newValue)
            "
            input-type="textarea"
          />
        </div>
      </div>
    </UContainer>
    <div v-else>
      <FireMoleculesLoading message="Loading employer profile..." />
    </div>
  </client-only>
</template>

<script setup>
import { useEmployers } from '../../../composables/firestore/objects/Employer/useEmployers'

const { employer, updateEmployer } = useEmployers()
const { saveField } = useEditHandler(updateEmployer)

// Toggle state for expanding/collapsing edit form
const isExpanded = ref(false)
</script>

<style scoped>
.edit-component {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 100%;
}

.info-section {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.fields-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (max-width: 640px) {
  .edit-component {
    gap: var(--space-4);
  }

  .info-section {
    padding: var(--space-3);
  }

  .section-title {
    font-size: 1rem;
  }
}
</style>
