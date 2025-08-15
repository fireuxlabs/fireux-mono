<template>
  <div class="places-search">
    <UInput
      v-model="searchQuery"
      placeholder="Search for kitchens, restaurants..."
      icon="i-heroicons-magnifying-glass"
      size="lg"
      @input="performSearch"
    />

    <!-- Search Results -->
    <div v-if="mergedResults.length > 0" class="results-list mt-4">
      <UCard
        v-for="place in mergedResults"
        :key="place.place_id || place.id"
        class="mb-2 cursor-pointer hover:bg-gray-50"
        @click="handleSelectPlace(place)"
      >
        <div class="flex items-center space-x-3">
          <UAvatar :src="place.image_url" :alt="place.name" size="sm" />
          <div class="flex-1">
            <h3 class="font-medium">{{ place.name }}</h3>
            <p class="text-sm text-gray-600">
              {{
                place.formatted_address ||
                place.short_address ||
                'Address not available'
              }}
            </p>
            <UBadge
              :label="place.source === 'google' ? 'Google Places' : 'Existing'"
              :color="place.source === 'google' ? 'blue' : 'green'"
              size="xs"
              class="mt-1"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- No Results -->
    <div v-else-if="searchQuery && !isSearching" class="no-results mt-4">
      <UCard>
        <div class="text-center py-4">
          <p class="text-gray-500">No kitchens found for "{{ searchQuery }}"</p>
        </div>
      </UCard>
    </div>

    <!-- Loading -->
    <div v-if="isSearching" class="loading mt-4">
      <UCard>
        <div class="text-center py-4">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"
          ></div>
          <p class="text-sm text-gray-500 mt-2">Searching...</p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{
  'select-place': [place: any]
}>()

// State
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const isSearching = ref(false)
const googleResults = ref([])
const firestoreResults = ref([])

// Debounce search query
let debounceTimeout: NodeJS.Timeout
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newQuery
    if (newQuery && newQuery.length >= 3) {
      performSearch()
    }
  }, 500)
})

// Mock search for now - in real implementation this would use Google Places API
const mergedResults = computed(() => {
  if (!debouncedSearchQuery.value) return []

  // Mock results for demonstration
  const mockResults = [
    {
      id: 'mock-1',
      name: 'The French Kitchen',
      formatted_address: '123 Main St, City, Country',
      source: 'google',
      place_id: 'mock-place-1',
      image_url: 'https://via.placeholder.com/40',
    },
    {
      id: 'mock-2',
      name: 'Pasta Palace',
      formatted_address: '456 Oak Ave, City, Country',
      source: 'firestore',
      image_url: 'https://via.placeholder.com/40',
    },
  ].filter((place) =>
    place.name.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase())
  )

  return mockResults
})

// Methods
const performSearch = async () => {
  if (!debouncedSearchQuery.value || debouncedSearchQuery.value.length < 3) {
    return
  }

  isSearching.value = true

  try {
    // TODO: Implement actual Google Places API search
    // TODO: Implement Firestore kitchen search

    // Mock delay for demo
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isSearching.value = false
  }
}

const handleSelectPlace = (place: any) => {
  emit('select-place', place)
  searchQuery.value = ''
}
</script>

<style scoped>
.places-search {
  width: 100%;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
