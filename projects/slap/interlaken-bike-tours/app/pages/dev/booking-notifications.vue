<template>
  <UPage>
    <UPageHeader title="Booking emails" description="Local delivery preview" />
    <UPageBody>
      <UButton :loading="status === 'pending'" @click="refresh()"
        >Refresh</UButton
      >
      <UAlert v-if="error" title="Could not load emails" />
      <NotificationEmail
        v-for="delivery in data"
        :key="delivery.message.id"
        :delivery="delivery"
      />
      <p v-if="!data?.length && !error">No booking emails yet.</p>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import NotificationEmail from 'fireux-notifications/runtime/components/Email.vue'
import type { EmailDelivery } from 'fireux-notifications/runtime/types/email'
if (!import.meta.dev) throw createError({ statusCode: 404 })
const { data, status, error, refresh } = useFetch<EmailDelivery[]>(
  '/api/dev/booking-notifications'
)
</script>
