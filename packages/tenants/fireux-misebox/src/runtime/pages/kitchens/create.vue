<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Create Your Kitchen</h1>
      <p class="text-gray-600 mt-2">
        Set up your kitchen to start managing ingredients and recipes
      </p>
    </div>

    <MiseKitchenWizard @success="handleSuccess" @error="handleError" />

    <!-- Success Toast -->
    <UNotification
      v-if="successMessage"
      :timeout="5000"
      color="green"
      icon="i-heroicons-check-circle"
      :title="successMessage"
      @close="successMessage = ''"
    />

    <!-- Error Toast -->
    <UNotification
      v-if="errorMessage"
      :timeout="5000"
      color="red"
      icon="i-heroicons-exclamation-circle"
      :title="errorMessage"
      @close="errorMessage = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Kitchen } from '../../models/objects/Kitchen.model'

// State
const successMessage = ref('')
const errorMessage = ref('')

// Event handlers
const handleSuccess = async (kitchen: Kitchen) => {
  successMessage.value = `Kitchen "${kitchen.name}" created successfully!`

  // Navigate to the new kitchen after a short delay
  setTimeout(() => {
    window.location.href = `/kitchens/${kitchen.id}`
  }, 2000)
}

const handleError = (error: string) => {
  errorMessage.value = error
}
</script>
