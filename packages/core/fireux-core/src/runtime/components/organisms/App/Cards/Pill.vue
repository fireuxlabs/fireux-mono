<template>
  <UCard class="pill">
    <div class="pill-content">
      <div
        class="app-icon"
        :style="{ backgroundColor: app?.theme?.primary || '#3b82f6' }"
      >
        <UIcon :name="getAppIcon(app?.id)" />
      </div>

      <div class="pill-info">
        <div class="pill-title">
          {{ appName }}
        </div>
        <div class="pill-subtitle">
          {{ app?.id || 'Unknown ID' }}
        </div>
      </div>

      <UBadge v-if="isInitialized" color="green" variant="soft">
        Active
      </UBadge>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps(['app'])

// Use the same computed properties that would be available from useApp
const appName = computed(
  () => props.app?.name || props.app?.id || 'Unknown App'
)
const isInitialized = computed(() => !!props.app?.admin_ids?.length)

function getAppIcon(appId) {
  const iconMap = {
    fireux: 'i-heroicons-fire',
    cleanbox: 'i-heroicons-sparkles',
    misebox: 'i-heroicons-beaker',
    default: 'i-heroicons-cube',
  }
  return iconMap[appId] || iconMap.default
}
</script>
