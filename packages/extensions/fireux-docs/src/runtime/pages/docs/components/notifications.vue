<template>
  <UPage>
    <UPageHeader
      title="Email notification"
      headline="Notifications Extension"
      description="A host supplies the message and delivery state."
    />
    <UPageBody><NotificationEmail :delivery="delivery" /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import NotificationEmail from 'fireux-notifications/runtime/components/Email.vue'
import type { EmailDelivery } from 'fireux-notifications/runtime/types/email'
const delivery: EmailDelivery = {
  message: {
    id: 'example',
    from: 'sender@example.test',
    to: 'recipient@example.test',
    subject: 'Your confirmation',
    text: 'Your request is confirmed.\nReference: SAMPLE-001',
  },
  status: 'captured',
  attempts: 1,
}
definePageMeta({ layout: 'docs', title: 'Email notification' })
</script>
