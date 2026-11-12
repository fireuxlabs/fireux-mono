<template>
  <UPageCard :title="delivery.message.subject" icon="i-lucide-mail">
    <UBadge :label="delivery.status" variant="subtle" />
    <dl>
      <dt>From</dt>
      <dd>{{ delivery.message.from }}</dd>
      <dt>To</dt>
      <dd>{{ delivery.message.to }}</dd>
    </dl>
    <p class="notification-email__text">{{ delivery.message.text }}</p>
  </UPageCard>
</template>
<script setup lang="ts">
import type { EmailDelivery } from '../types/email'
defineProps<{ delivery: EmailDelivery }>()
</script>
<style scoped>
.notification-email__text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
dt {
  color: var(--ui-text-muted);
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
