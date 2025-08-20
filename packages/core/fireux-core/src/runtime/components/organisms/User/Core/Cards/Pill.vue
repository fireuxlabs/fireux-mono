<template>
  <UCard class="pill">
    <div class="pill-content">
      <UAvatar
        :src="coreUser?.avatar"
        :alt="coreUser?.display_name || coreUser?.email || 'Core User'"
        size="sm"
      />

      <div class="pill-info">
        <div class="pill-title">
          {{ coreUser?.display_name || coreUser?.email || 'Unknown User' }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
// Props should match CoreUser.Card.Pill interface (just avatar and display name)
defineProps(['coreUser'])
</script>
