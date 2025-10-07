<template>
  <div class="form-field">
    <!-- Top Section: Label, Icons, and Error Handling -->
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="!!firebaseValue?.formatted_address"
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="saveChanges"
      @cancel="cancelEditing"
      @delete="deleteValue"
    />

    <!-- Display Mode -->
    <div v-if="!isEditing" class="display">
      <span v-if="firebaseValue?.formatted_address" class="text-gray-700">
        {{ firebaseValue.formatted_address }}
      </span>
      <span v-else class="text-gray-500">{{ placeholder || 'Not set' }}</span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="editing">
      <div class="relative">
        <UInput
          v-model="searchQuery"
          :placeholder="placeholder || 'Start typing an address...'"
          class="w-full"
          @input="onSearchInput"
          @keyup.enter="selectFirstSuggestion"
          @keyup.esc="cancelEditing"
          @focus="showSuggestions = true"
        />

        <!-- Suggestions Dropdown -->
        <div
          v-if="showSuggestions && suggestions.length > 0"
          class="suggestions-dropdown"
        >
          <div
            v-for="(suggestion, index) in suggestions"
            :key="suggestion.place_id || suggestion.id"
            class="suggestion-item"
            :class="{ highlighted: index === highlightedIndex }"
            @click="selectSuggestion(suggestion)"
            @mouseenter="highlightedIndex = index"
          >
            <div class="suggestion-main">
              {{
                suggestion.name ||
                suggestion.formatted_address ||
                'Unknown place'
              }}
            </div>
            <div class="suggestion-secondary">
              {{ suggestion.formatted_address || '—' }}
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoadingPlaces" class="loading-indicator">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        </div>
      </div>

      <!-- Manual entry fallback -->
      <div class="manual-entry">
        <button
          type="button"
          @click="toggleManualEntry"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          {{ showManualEntry ? 'Use autocomplete' : 'Enter manually' }}
        </button>

        <div v-if="showManualEntry" class="manual-fields mt-3 space-y-2">
          <UInput
            v-model="manualAddress.street"
            placeholder="Street address"
            class="w-full"
          />
          <div class="grid grid-cols-2 gap-2">
            <UInput
              v-model="manualAddress.city"
              placeholder="City"
              class="w-full"
            />
            <UInput
              v-model="manualAddress.state"
              placeholder="State"
              class="w-full"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <UInput
              v-model="manualAddress.country"
              placeholder="Country"
              class="w-full"
            />
            <UInput
              v-model="manualAddress.postal_code"
              placeholder="Postal Code"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlaces } from '../../composables/usePlaces'
import { ref, watch, onMounted } from 'vue'

const PLACE_ICON_FALLBACK =
  'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png'

const props = defineProps({
  label: { type: String, default: 'Address' },
  firebaseValue: { type: Object, default: null },
  placeholder: { type: String, default: 'Start typing an address...' },
  updateFunction: { type: Function, required: true },
})

// Composables
const {
  searchPlaces,
  getPlaceDetails,
  isLoading: isLoadingPlaces,
  clearSuggestions,
} = usePlaces()

// Local reactive state
const isEditing = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestions = ref([])
const highlightedIndex = ref(-1)
const showManualEntry = ref(false)
const manualAddress = ref({
  street: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
})

// Debounced search
let searchTimeout = null

// Watch for prop changes
watch(
  () => props.firebaseValue,
  (newValue) => {
    if (!isEditing.value && newValue?.formatted_address) {
      searchQuery.value = newValue.formatted_address
    }
  },
  { immediate: true }
)

// Search input handler
async function onSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.length >= 3) {
      try {
        suggestions.value = await searchPlaces(searchQuery.value)
        showSuggestions.value = true
        highlightedIndex.value = -1
      } catch (error) {
        if (process.dev) {
          // eslint-disable-next-line no-console
          console.error('Search error:', error)
        }
        suggestions.value = []
      }
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  }, 300)
}

// Select suggestion
async function selectSuggestion(suggestion) {
  try {
    const placeDetails = await getPlaceDetails(
      suggestion.place_id || suggestion.id
    )
    if (placeDetails) {
      searchQuery.value = placeDetails.formatted_address
      showSuggestions.value = false
      await savePlace(placeDetails)
    }
  } catch (error) {
    if (process.dev) {
      // eslint-disable-next-line no-console
      console.error('Error selecting place:', error)
    }
    errorMessage.value = 'Failed to select location'
  }
}

// Select first suggestion with Enter key
function selectFirstSuggestion() {
  if (suggestions.value.length > 0) {
    selectSuggestion(suggestions.value[0])
  }
}

// Toggle manual entry
function toggleManualEntry() {
  showManualEntry.value = !showManualEntry.value
  if (showManualEntry.value) {
    showSuggestions.value = false
  }
}

// Editing handlers
function startEditing() {
  searchQuery.value = props.firebaseValue?.formatted_address || ''
  errorMessage.value = ''
  isEditing.value = true
  showSuggestions.value = false
  showManualEntry.value = false
}

function cancelEditing() {
  searchQuery.value = props.firebaseValue?.formatted_address || ''
  errorMessage.value = ''
  isEditing.value = false
  showSuggestions.value = false
  clearSuggestions()
}

async function saveChanges() {
  try {
    if (showManualEntry.value) {
      // Save manual entry as a simple address
      const placeId = `manual_${Date.now()}`
      const manualPlace = {
        place_id: placeId,
        name: formatManualAddress() || 'Manual entry',
        formatted_address: formatManualAddress(),
        lat: 0,
        lng: 0,
        avatar: PLACE_ICON_FALLBACK,
        source: 'firestore',
        id: placeId,
        website: null,
        phone: null,
        rating: null,
        user_ratings_total: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        manual_address: { ...manualAddress.value },
      }
      await savePlace(manualPlace)
    } else if (searchQuery.value.trim()) {
      // Try to find exact match in suggestions or search again
      if (suggestions.value.length > 0) {
        await selectSuggestion(suggestions.value[0])
      } else {
        errorMessage.value = 'Please select a suggestion or use manual entry'
        return
      }
    } else {
      errorMessage.value = 'Please enter an address'
      return
    }
  } catch (error) {
    // Provide feedback to the user; log only in dev
    if (process.dev) {
      // eslint-disable-next-line no-console
      console.error('Error saving address:', error)
    }
    errorMessage.value = (error && error.message) || 'Failed to save address'
    isEditing.value = false
    showSuggestions.value = false
  }
}

async function savePlace(place) {
  await props.updateFunction(place)
  errorMessage.value = ''
  isEditing.value = false
  showSuggestions.value = false
}

async function deleteValue() {
  try {
    await props.updateFunction(null)
    searchQuery.value = ''
    errorMessage.value = ''
    isEditing.value = false
    showSuggestions.value = false
  } catch (error) {
    if (process.dev) {
      // eslint-disable-next-line no-console
      console.error('Error deleting address:', error)
    }
    errorMessage.value = 'Failed to delete address'
    isEditing.value = false
    showSuggestions.value = false
  }
}

function formatManualAddress() {
  const { street, city, state, country, postal_code } = manualAddress.value
  const parts = [street, city, state, postal_code, country].filter(Boolean)
  return parts.join(', ')
}

// Hide suggestions when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.form-field')) {
      showSuggestions.value = false
    }
  })
})
</script>

<style scoped>
.display {
  padding: 0.5rem;
  display: flex;
  align-items: center;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  margin-top: 2px;
}

.suggestion-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background-color: #f9fafb;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-main {
  font-weight: 500;
  color: #111827;
}

.suggestion-secondary {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.loading-indicator {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.manual-entry {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}
</style>
