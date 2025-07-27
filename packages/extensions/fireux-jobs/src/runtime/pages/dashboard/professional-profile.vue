<template>
  <client-only>
    <div v-if="isProfessional">
      <!-- Profile Display -->
      <FireOrganismsProfessionalCardsProfile
        :professional="currentProfessional"
      />

      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Edit Professional Information</h3>
        <UButton
          :icon="
            isEditMode ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          variant="ghost"
          size="sm"
          @click="isEditMode = !isEditMode"
        >
          {{ isEditMode ? 'Hide' : 'Edit' }}
        </UButton>
      </div>

      <!-- Edit Form (conditionally shown) -->
      <FireOrganismsProfessionalEdit
        v-if="isEditMode"
        :professional="currentProfessional"
      />
    </div>
    <FireOrganismsProfessionalCreateSystem v-else />
  </client-only>
</template>

<script setup>
import { useAppUserRoutes } from '../../../../core/fireux-core/src/runtime/composables/app/routes/useAppUserRoutes'
const userGroup = useAppUserRoutes()[0]
const routeObj = userGroup.children.find(
  (r) => r.to === '/dashboard/professional-profile'
)
const { label, icon } = routeObj

// Set static meta at build time for Nuxt
definePageMeta({
  layout: 'dashboard',
})

// Set dynamic head meta at runtime (reactive)
useHead({
  title: label,
  meta: [{ name: 'icon', content: icon }],
})

// Initialize professionals composable - now reactive and simple!
const { isProfessional, currentProfessional } = useProfessionals()

// Edit mode state - controlled by this page
const isEditMode = ref(false)
</script>
