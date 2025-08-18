<template>
  <UCard>
    <div style="display: flex; align-items: flex-start; gap: 16px">
      <div
        style="
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        "
        :style="{ backgroundColor: app?.theme?.primary || '#3b82f6' }"
      >
        <UIcon
          :name="getAppIcon(app?.id)"
          style="color: white; font-size: 24px"
        />
      </div>

      <div style="flex: 1; min-width: 0">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          "
        >
          <h3 style="font-weight: 600; margin: 0">
            {{ appName }}
          </h3>
          <div style="display: flex; gap: 8px">
            <UBadge v-if="isInitialized" color="green" variant="soft">
              Active
            </UBadge>
            <UBadge v-if="hasAdmins" color="blue" variant="soft">
              {{ adminCount }} Admin{{ adminCount !== 1 ? 's' : '' }}
            </UBadge>
          </div>
        </div>

        <p
          v-if="app?.description"
          style="margin: 0 0 8px 0; color: rgb(107 114 128); font-size: 14px"
        >
          {{ app.description }}
        </p>

        <div
          style="
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 13px;
            color: rgb(107 114 128);
          "
        >
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
