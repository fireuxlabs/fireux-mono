<template>
  <client-only>
    <UContainer v-if="professional" class="edit-component">
      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="section-title">Edit Professional Information</h3>
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

      <!-- Professional Information Section -->
      <div v-show="isExpanded" class="info-section">
        <div class="fields-container">
          <!-- Single Fields -->
          <FireMoleculesFormsFirestoreSingleField
            label="Full Name"
            :firebase-value="professional.full_name || professional.name || ''"
            placeholder="Enter your full name"
            :update-function="
              (newValue) => saveField('Full Name', 'full_name', newValue)
            "
          />
          <FireMoleculesFormsFirestoreSingleField
            label="Professional Title"
            :firebase-value="professional.title || ''"
            placeholder="e.g. Senior Chef, Cleaning Specialist"
            :update-function="
              (newValue) => saveField('Professional Title', 'title', newValue)
            "
          />
          <FireMoleculesFormsFirestoreSingleField
            label="Contact Email"
            :firebase-value="professional.contactEmail || ''"
            placeholder="Your contact email"
            :update-function="
              (newValue) => saveField('Contact Email', 'contactEmail', newValue)
            "
          />
          <FireMoleculesFormsFirestoreSingleField
            label="Phone Number"
            :firebase-value="professional.phone || ''"
            placeholder="Your phone number"
            :update-function="
              (newValue) => saveField('Phone Number', 'phone', newValue)
            "
          />
          <FireMoleculesFormsFirestoreSingleField
            label="Bio"
            :firebase-value="professional.bio || ''"
            placeholder="Tell us about your experience and skills..."
            :update-function="(newValue) => saveField('Bio', 'bio', newValue)"
            input-type="textarea"
          />
        </div>
      </div>
    </UContainer>
    <div v-else>
      <FireMoleculesLoading message="Loading professional profile..." />
    </div>
  </client-only>
</template>

<script setup>
const { professional, updateProfessional } = useProfessionals()
const { saveField } = useEditHandler(updateProfessional)

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
