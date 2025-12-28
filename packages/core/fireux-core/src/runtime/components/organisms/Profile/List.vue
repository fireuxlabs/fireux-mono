<template>
  <div class="profile-list">
    <!-- Filter Section -->
    <div v-if="$slots.filters" class="filters-section">
      <slot name="filters" :filters="filters" :apply-filter="applyFilter" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">Loading profiles...</div>

    <!-- Profile Grid -->
    <div v-else-if="filteredProfiles?.length" class="profile-grid">
      <slot
        name="profile-item"
        v-for="profile in filteredProfiles"
        :key="profile.uid"
        :profile="profile"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No profiles found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'

type ProfileLike = { uid: string } & Record<string, unknown>

// Generic profile list component
const props = withDefaults(
  defineProps<{ profiles?: ProfileLike[]; loading?: boolean }>(),
  { profiles: () => [], loading: false }
)

// Simplified: no external filters, use provided list as-is
const filteredProfiles = toRef(props, 'profiles')
const filters = undefined
const applyFilter = undefined
</script>

<style scoped>
.profile-list {
  padding: 1rem;
}

.filters-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}
</style>
