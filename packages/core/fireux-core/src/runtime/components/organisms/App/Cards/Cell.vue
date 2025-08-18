<template>
  <UCard class="cell">
    <div class="cell-header">
      <div
        class="app-icon"
        :style="{ backgroundColor: app?.theme?.primary || '#3b82f6' }"
      >
        <UIcon :name="getAppIcon(app?.id)" />
      </div>

      <div class="cell-content">
        <div class="cell-title-row">
          <h3 class="cell-title">
            {{ appName }}
          </h3>
          <div class="cell-badges">
            <UBadge v-if="isInitialized" color="green" variant="soft">
              Active
            </UBadge>
            <UBadge v-if="hasAdmins" color="blue" variant="soft">
              {{ adminCount }} Admin{{ adminCount !== 1 ? 's' : '' }}
            </UBadge>
          </div>
        </div>

        <p v-if="app?.description" class="cell-subtitle">
          {{ app.description }}
        </p>

        <div class="cell-meta">
          <span>ID: {{ app?.id || 'Unknown' }}</span>
          <span v-if="app?.created_at">
            Created: {{ formatDate(app.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps(['app'])

// Computed properties matching useApp pattern
const appName = computed(
  () => props.app?.name || props.app?.id || 'Unknown App'
)
const isInitialized = computed(() => !!props.app?.admin_ids?.length)
const hasAdmins = computed(() => !!props.app?.admin_ids?.length)
const adminCount = computed(() => props.app?.admin_ids?.length || 0)

function getAppIcon(appId) {
  const iconMap = {
    fireux: 'i-heroicons-fire',
    cleanbox: 'i-heroicons-sparkles',
    misebox: 'i-heroicons-beaker',
    default: 'i-heroicons-cube',
  }
  return iconMap[appId] || iconMap.default
}

function formatDate(date) {
  if (!date) return 'Unknown'
  try {
    return new Date(date.seconds * 1000).toLocaleDateString()
  } catch {
    return 'Unknown'
  }
}
</script>
