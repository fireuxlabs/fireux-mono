<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold">Kitchens</h1>
        <p class="text-gray-600">Manage your kitchens and their ingredients</p>
      </div>
      
      <UButton 
        to="/kitchens/create" 
        color="primary" 
        icon="i-heroicons-plus"
        size="lg"
      >
        Create Kitchen
      </UButton>
    </div>

    <!-- Current User's Kitchens -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <h2 class="text-2xl font-semibold">My Kitchens</h2>
        <UBadge :label="userKitchens.length.toString()" color="primary" />
      </div>
      
      <div v-if="userKitchens.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="kitchen in userKitchens" :key="kitchen.id" class="hover:shadow-md transition-shadow">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">{{ kitchen.name }}</h3>
              <UBadge label="Owner" color="green" size="xs" />
            </div>
          </template>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-user" class="w-4 h-4" />
              <span>Owner ID: {{ kitchen.owner_id.slice(0, 8) }}...</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
              <span>{{ kitchen.ingredients.length }} ingredients</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              <span>{{ formatDate(kitchen.created_at) }}</span>
            </div>
          </div>

          <template #footer>
            <div class="flex gap-2">
              <UButton
                :to="`/kitchens/${kitchen.id}`"
                color="primary"
                variant="soft"
                size="sm"
                class="flex-1"
              >
                Manage
              </UButton>
              <UButton
                icon="i-heroicons-pencil"
                variant="outline"
                size="sm"
              />
            </div>
          </template>
        </UCard>
      </div>
      
      <div v-else class="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
        <UIcon name="i-heroicons-building-storefront" class="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p class="text-gray-500 mb-3">You don't have any kitchens yet</p>
        <UButton to="/kitchens/create" color="primary" variant="outline">
          Create Your First Kitchen
        </UButton>
      </div>
    </div>

    <!-- All Kitchens -->
    <div>
      <div class="flex items-center gap-3 mb-4">
        <h2 class="text-2xl font-semibold">All Kitchens</h2>
        <UBadge :label="allKitchens.length.toString()" color="gray" />
      </div>
      
      <div v-if="allKitchens.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="kitchen in allKitchens" :key="kitchen.id" class="hover:shadow-md transition-shadow">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">{{ kitchen.name }}</h3>
              <UBadge 
                :label="kitchen.owner_id === currentUser?.uid ? 'Mine' : 'Other'" 
                :color="kitchen.owner_id === currentUser?.uid ? 'green' : 'gray'" 
                size="xs" 
              />
            </div>
          </template>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-user" class="w-4 h-4" />
              <span>Owner: {{ kitchen.owner_id.slice(0, 8) }}...</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
              <span>{{ kitchen.ingredients.length }} ingredients</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              <span>{{ formatDate(kitchen.created_at) }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <UIcon name="i-heroicons-building-office" class="w-4 h-4" />
              <span>App: {{ kitchen.app_id }}</span>
            </div>
          </div>

          <template #footer>
            <UButton
              :to="`/kitchens/${kitchen.id}`"
              color="primary"
              variant="soft"
              size="sm"
              class="w-full"
            >
              View Kitchen
            </UButton>
          </template>
        </UCard>
      </div>
      
      <div v-else class="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
        <UIcon name="i-heroicons-building-storefront" class="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p class="text-gray-500">No kitchens found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useKitchens } from '../../composables/firestore/objects/Kitchen/useKitchens'

// Composables
const { all: allKitchens, hasKitchen, appKitchen, appId } = useKitchens()
const currentUser = useCurrentUser()

// Computed
const userKitchens = computed(() => {
  if (!currentUser.value?.uid) return []
  return allKitchens.value.filter(kitchen => kitchen.owner_id === currentUser.value!.uid)
})

// Methods
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Unknown date'
  }
}
</script>
