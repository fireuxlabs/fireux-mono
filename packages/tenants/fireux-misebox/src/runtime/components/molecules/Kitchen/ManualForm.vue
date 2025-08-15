<template>
  <div class="manual-kitchen-form">
    <UCard>
      <template #header>
        <h3>Enter Kitchen Details Manually</h3>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Kitchen Name" required>
          <UInput
            v-model="form.place_name"
            placeholder="e.g., The French Kitchen, Tony's Pizza"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="City">
          <UInput
            v-model="form.city"
            placeholder="e.g., London, Paris, New York"
          />
        </UFormGroup>

        <UFormGroup label="Region/State">
          <UInput
            v-model="form.region"
            placeholder="e.g., England, Île-de-France, California"
          />
        </UFormGroup>

        <UFormGroup label="Country">
          <UInput
            v-model="form.country"
            placeholder="e.g., United Kingdom, France, United States"
          />
        </UFormGroup>

        <!-- Preview Address -->
        <div v-if="formattedAddress" class="preview-address">
          <p class="text-sm text-gray-600">Address Preview:</p>
          <p class="font-medium">{{ formattedAddress }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <UButton
            variant="ghost"
            @click="handleCancel"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            :disabled="!form.place_name"
            @click="handleSubmit"
          >
            Continue
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

// Form state
const form = ref({
  place_name: '',
  city: '',
  region: '',
  country: '',
})

// Computed formatted address
const formattedAddress = computed(() => {
  const parts = [form.value.city, form.value.region, form.value.country]
    .filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : ''
})

// Methods
const handleSubmit = () => {
  if (!form.value.place_name) return
  
  emit('submit', {
    ...form.value,
    formatted_address: formattedAddress.value,
    source: 'manual'
  })
}

const handleCancel = () => {
  // Reset form
  form.value = {
    place_name: '',
    city: '',
    region: '',
    country: '',
  }
  emit('cancel')
}
</script>

<style scoped>
.manual-kitchen-form {
  max-width: 500px;
  margin: 0 auto;
}

.preview-address {
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
</style>
