<template>
  <div class="kitchen-wizard">
    <h2>Create Your Kitchen</h2>

    <!-- Search Mode -->
    <div v-if="mode === 'search'" class="search-mode">
      <div class="search-section">
        <!-- Simple search input for now -->
        <UInput
          v-model="searchQuery"
          placeholder="Search for your kitchen or restaurant..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
          @input="handleSearch"
        />

        <!-- Autocomplete results -->
        <div v-if="predictions.length > 0" class="results mt-4 space-y-2">
          <UCard
            v-for="p in predictions"
            :key="p.place_id"
            class="cursor-pointer hover:bg-gray-50"
            @click="selectPrediction(p)"
          >
            <div class="flex items-center space-x-3">
              <UAvatar
                :alt="p.structured_formatting?.main_text || p.description"
                size="sm"
              />
              <div>
                <h3 class="font-medium">
                  {{ p.structured_formatting?.main_text || p.description }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ p.structured_formatting?.secondary_text }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Selected Kitchen Preview -->
        <div v-if="selectedKitchen.name" class="selected-preview">
          <UCard class="mt-4">
            <template #header>
              <div class="flex justify-between items-center">
                <h3>{{ selectedKitchen.name }}</h3>
                <UButton
                  icon="i-heroicons-x-mark"
                  variant="ghost"
                  @click="clearSelection"
                />
              </div>
            </template>

            <div>
              <p v-if="selectedKitchen.address" class="text-gray-600">
                {{ selectedKitchen.address }}
              </p>
              <UBadge
                :label="
                  selectedKitchen.source === 'search'
                    ? 'From Search'
                    : 'Manual Entry'
                "
                :color="
                  selectedKitchen.source === 'search' ? 'info' : 'success'
                "
                class="mt-2"
              />
            </div>
          </UCard>
        </div>

        <!-- Can't find option -->
        <div v-if="!selectedKitchen.name" class="mt-4 text-center">
          <p class="text-gray-500 mb-2">Can't find your kitchen?</p>
          <UButton variant="outline" @click="switchToManual">
            Enter Details Manually
          </UButton>
        </div>
      </div>

      <!-- Action Button -->
      <div v-if="selectedKitchen.name" class="action-section mt-6">
        <UButton
          color="primary"
          size="lg"
          block
          :loading="isCreating"
          @click="handleCreateKitchen"
        >
          {{
            selectedKitchen.source === 'search'
              ? 'Save Selected Kitchen'
              : selectedKitchen.source === 'manual'
              ? 'Create Kitchen'
              : 'Join Kitchen'
          }}
        </UButton>
      </div>
    </div>

    <!-- Manual Mode -->
    <div v-else-if="mode === 'manual'" class="manual-mode">
      <MiseKitchenManualForm
        @submit="handleManualSubmit"
        @cancel="switchToSearch"
      />

      <!-- Action Button -->
      <div v-if="manualKitchen.name" class="action-section mt-6">
        <UButton
          color="primary"
          size="lg"
          block
          :loading="isCreating"
          @click="handleCreateKitchen"
        >
          Create Kitchen
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  Kitchen,
  NewKitchenInput,
} from '../../../models/objects/Kitchen.model'
import { useKitchenCreation } from '../../../composables/firestore/objects/Kitchen/useKitchenCreation'

const emit = defineEmits<{
  success: [kitchen: Kitchen]
  error: [error: string]
}>()

// State
const mode = ref<'search' | 'manual'>('search')
const selectedKitchen = ref<any>({})
const manualKitchen = ref<NewKitchenInput>({ name: '' })
const isCreating = ref(false)
const searchQuery = ref('')
const predictions = ref<any[]>([])
let debounce: any

// Composables
const { create } = useKitchenCreation()

// Methods
// Methods
const handleSearch = () => {
  clearTimeout(debounce)
  if (!searchQuery.value) {
    predictions.value = []
    return
  }
  debounce = setTimeout(async () => {
    const { data } = await useFetch<{ predictions?: any[] }>('/api/places/autocomplete', {
      query: { q: searchQuery.value },
    })
    predictions.value = (data.value && 'predictions' in data.value ? data.value.predictions : []) || []
  }, 250)
}

const selectPrediction = async (p: any) => {
  const { data } = await useFetch<{ result?: any }>('/api/places/details', {
    query: { id: p.place_id },
  })
  const result = data.value && 'result' in data.value ? data.value.result : undefined
  if (result) {
    selectedKitchen.value = {
      name: result.name,
      address: result.formatted_address,
      place_id: result.place_id,
      location: result.geometry?.location,
      source: 'search',
    }
  }
  searchQuery.value = ''
  predictions.value = []
}

const handleManualSubmit = (kitchenData: any) => {
  manualKitchen.value = {
    name: kitchenData.place_name,
  }
  selectedKitchen.value = {
    ...kitchenData,
    source: 'manual',
  }
}

const clearSelection = () => {
  selectedKitchen.value = {}
  manualKitchen.value = { name: '' }
}

const switchToManual = () => {
  mode.value = 'manual'
  clearSelection()
}

const switchToSearch = () => {
  mode.value = 'search'
  clearSelection()
}

const handleCreateKitchen = async () => {
  if (!selectedKitchen.value.name && !manualKitchen.value.name) return

  isCreating.value = true

  try {
    let kitchenData: NewKitchenInput

    if (mode.value === 'manual') {
      kitchenData = manualKitchen.value
    } else {
      kitchenData = {
        name: selectedKitchen.value.name,
      }
    }

    const newKitchen = await create(kitchenData)

    emit('success', newKitchen)
  } catch (error: any) {
    emit('error', error.message || 'Failed to create kitchen')
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.kitchen-wizard {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.search-section {
  margin-bottom: 2rem;
}

.selected-preview {
  animation: fadeIn 0.3s ease-in;
}

.action-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
