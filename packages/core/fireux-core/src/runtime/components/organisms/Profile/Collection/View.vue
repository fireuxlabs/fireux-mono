<template>
  <div class="profile-list">
    <OrganismsProfileCollectionManager
      :profiles="profiles"
      :loading="loading"
      v-slot="{ profiles: filteredProfiles, loading: isLoading }"
    >
      <!-- Filter Section -->
      <div v-if="$slots.filters" class="filters-section">
        <slot name="filters" :filters="filters" :apply-filter="applyFilter" />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">Loading profiles...</div>

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
    </OrganismsProfileCollectionManager>
  </div>
</template>

<script setup lang="ts">
type ProfileLike = { uid: string } & Record<string, unknown>

const props = withDefaults(
  defineProps<{ profiles?: ProfileLike[]; loading?: boolean }>(),
  { profiles: () => [], loading: false }
)

const { profiles, loading } = props

// Legacy filter passthrough: currently unused, but preserved for slot signature.
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
