<template>
  <UPage>
    <UPageHeader
      title="Notifications"
      description="Compose an email and inspect its delivery."
    />
    <UPageBody>
      <UPageCard title="Input">
        <UFormField label="From"
          ><UInput v-model="from" type="email"
        /></UFormField>
        <UFormField label="To"><UInput v-model="to" type="email" /></UFormField>
        <UFormField label="Subject"><UInput v-model="subject" /></UFormField>
        <UFormField label="Message"><UTextarea v-model="text" /></UFormField>
        <UAlert
          v-if="error"
          :description="error"
          title="Check the email"
          color="error"
        />
        <UButton @click="capture">Capture email</UButton>
      </UPageCard>
      <NotificationEmail
        v-for="delivery in deliveries"
        :key="delivery.message.id"
        :delivery="delivery"
      />
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import NotificationEmail from 'fireux-notifications/runtime/components/Email.vue'
import {
  captureEmail,
  createEmailDelivery,
} from 'fireux-notifications/runtime/utils/email-delivery'
import type { EmailDelivery } from 'fireux-notifications/runtime/types/email'
const from = ref('')
const to = ref('')
const subject = ref('')
const text = ref('')
const error = ref('')
const deliveries = ref<EmailDelivery[]>([])
const ledger = createEmailDelivery(captureEmail)
async function capture() {
  error.value = ''
  try {
    await ledger.send({
      id: crypto.randomUUID(),
      from: from.value,
      to: to.value,
      subject: subject.value,
      text: text.value,
    })
    deliveries.value = ledger.list()
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Could not capture email.'
  }
}
</script>
