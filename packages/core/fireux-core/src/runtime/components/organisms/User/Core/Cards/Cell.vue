<template>
  <UCard class="cell">
    <div class="cell-header">
      <UAvatar
        :src="coreUser?.photoURL"
        :alt="coreUser?.displayName || 'Core User'"
        size="lg"
      />

      <div class="cell-content">
        <div class="cell-title-row">
          <h3 class="cell-title">
            {{ coreUser?.displayName || 'Unknown User' }}
          </h3>
          <div class="cell-badges">
            <UBadge v-if="coreUser?.emailVerified" color="green" variant="soft">
              Verified
            </UBadge>
            <UBadge v-if="hasMultipleApps" color="blue" variant="soft">
              {{ userOfApps }} Apps
            </UBadge>
          </div>
        </div>

        <p v-if="coreUser?.email" class="cell-subtitle">
          {{ coreUser.email }}
        </p>

        <div v-if="coreUser?.userOf?.length" class="cell-tags">
          <UBadge
            v-for="app in coreUser.userOf.slice(0, 3)"
            :key="app"
            variant="outline"
          >
            {{ app }}
          </UBadge>
          <UBadge v-if="coreUser.userOf.length > 3" variant="outline">
            +{{ coreUser.userOf.length - 3 }} more
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps(['coreUser'])

// These would normally come from useCoreUserComputed, but for display purposes:
const hasMultipleApps = computed(
  () => (props.coreUser?.userOf?.length || 0) > 1
)
const userOfApps = computed(() => props.coreUser?.userOf?.length || 0)
</script>
