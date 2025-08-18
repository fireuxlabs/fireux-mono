<template>
  <UCard>
    <div style="display: flex; align-items: center; gap: 12px">
      <div
        style="
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        :style="{ backgroundColor: app?.theme?.primary || '#3b82f6' }"
      >
        <UIcon
          :name="getAppIcon(app?.id)"
          style="color: white; font-size: 20px"
        />
      </div>

      <div style="flex: 1">
        <div style="font-weight: 600; margin-bottom: 4px">
          {{ appName }}
        </div>
        <div style="font-size: 14px; color: rgb(107 114 128)">
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
