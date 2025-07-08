<template>
  <UCard
    class="professional-cell"
    @click="navigateTo(`/professionals/${professional.id}`)"
  >
    <div class="professional-header">
      <!-- Avatar -->
      <div class="avatar-container">
        <UAvatar
          v-if="professional.avatarUrl"
          :src="professional.avatarUrl"
          :alt="professionalName"
          size="md"
        />
        <UAvatar
          v-else
          :text="getInitials(professionalName)"
          size="md"
          color="primary"
        />
      </div>

      <!-- Content -->
      <div class="professional-info">
        <h3 class="professional-name">
          {{ professionalName }}
        </h3>

        <p
          v-if="professional.title && professional.displayName"
          class="professional-title"
        >
          {{ professional.title }}
        </p>

        <p v-if="professional.bio_short" class="professional-bio">
          {{ professional.bio_short }}
        </p>

        <p class="professional-id">ID: {{ professional.id }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})

// Computed property for professional display name
const professionalName = computed(() => {
  if (!props.professional) return 'Professional'
  return (
    props.professional.displayName || props.professional.title || 'Professional'
  )
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'P'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.professional-cell {
  cursor: pointer;
  transition: all 0.2s ease;
}

.professional-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.professional-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.avatar-container {
  flex-shrink: 0;
}

.professional-info {
  flex: 1;
  min-width: 0;
}

.professional-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0 0 var(--space-1) 0;
}

.professional-title {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: 0 0 var(--space-2) 0;
}

.professional-bio {
  font-size: 0.875rem;
  color: var(--ui-text);
  margin: 0 0 var(--space-3) 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.professional-id {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  font-family: monospace;
  margin: 0;
}
</style>
