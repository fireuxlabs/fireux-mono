<template>
  <client-only>
    <div v-if="isEmployer">
      <!-- Profile Display -->
      <FireOrganismsEmployerCardsProfile :employer="currentEmployer" />

      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Edit Company Information</h3>
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
      <FireOrganismsEmployerEdit
        v-if="isEditMode"
        :employer="currentEmployer"
      />
    </div>
    <FireOrganismsEmployerCreateSystem v-else />
  </client-only>
</template>

<script setup>
const userGroup = useAppUserRoutes()[0]
const routeObj = userGroup.children.find(
  (r) => r.to === '/dashboard/employer-profile'
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

// Initialize employers composable - now reactive and simple!
const { isEmployer, currentEmployer } = useEmployers()

// Edit mode state - controlled by this page
const isEditMode = ref(false)
</script>
