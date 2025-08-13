<template>
  <div class="objects-page">
    <!-- Filter Controls -->
    <div v-if="showFilters" class="filter-controls">
      <slot name="filters" :filters="filters" :reset="resetFilters" />
    </div>

    <!-- Create/Add Section -->
    <div v-if="showCreate" class="create-section">
      <slot name="create" />
    </div>

    <!-- Objects List -->
    <div class="objects-list">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading {{ config.objectType }}s...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>
          Error loading {{ config.objectType }}s: {{ error.message || error }}
        </p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredObjects?.length" class="empty-state">
        <p>No {{ config.objectType }}s found.</p>
        <slot name="empty-actions" />
      </div>

      <!-- Objects Grid/List -->
      <div v-else class="objects-grid" :class="`view-${viewMode}`">
        <slot
          name="object-item"
          v-for="object in filteredObjects"
          :key="object.id"
          :object="object"
          :navigate="navigateToObject"
        />
      </div>
    </div>

    <!-- View Controls -->
    <div v-if="showViewControls" class="view-controls">
      <button
        v-for="mode in ['grid', 'list', 'card']"
        :key="mode"
        @click="viewMode = mode"
        :class="{ active: viewMode === mode }"
        class="view-button"
      >
        {{ mode }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true,
    // Expected shape: { objectType: 'ingredient', collectionName: 'ingredients', ... }
  },
  filterComposable: {
    type: Function,
    required: true,
  },
  objects: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Error, String, null],
    default: null,
  },
  showFilters: {
    type: Boolean,
    default: true,
  },
  showCreate: {
    type: Boolean,
    default: true,
  },
  showViewControls: {
    type: Boolean,
    default: true,
  },
})

// View mode state
const viewMode = ref('grid')

// Apply filters using the provided filter composable
const {
  filters,
  filteredIngredients: filteredObjects,
  resetFilters,
} = props.filterComposable(computed(() => props.objects))

// Navigation function for object clicks
const navigateToObject = (object) => {
  if (object?.id) {
    navigateTo(`/${props.config.collectionName}/${object.id}`)
  }
}
</script>

<style scoped>
.objects-page {
  padding: 1rem;
}

.filter-controls {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 0.5rem;
  border: 1px solid var(--gray-200);
}

.create-section {
  margin-bottom: 2rem;
}

.objects-list {
  min-height: 200px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--gray-600);
}

.error-state {
  color: var(--red-600);
}

.objects-grid {
  display: grid;
  gap: 1rem;
}

.objects-grid.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.objects-grid.view-list {
  grid-template-columns: 1fr;
}

.objects-grid.view-card {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.view-controls {
  margin-top: 2rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.view-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  background: white;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-button:hover {
  background: var(--gray-50);
}

.view-button.active {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}
</style>
