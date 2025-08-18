<template>
  <UCard class="pill">
    <div class="pill-content">
      <UAvatar
        :src="coreUser?.photoURL"
        :alt="coreUser?.displayName || coreUser?.email || 'Core User'"
        size="sm"
      />

      <div class="pill-info">
        <div class="pill-title">
          {{ coreUser?.displayName || coreUser?.email || 'Unknown User' }}
        </div>
        <div class="pill-subtitle">
          {{ coreUser?.id || 'No ID' }}
        </div>
      </div>

      <UBadge v-if="coreUser?.emailVerified" color="green" variant="soft">
        Verified
      </UBadge>
    </div>
  </UCard>
</template>

<script setup>
defineProps(['coreUser'])
</script>
