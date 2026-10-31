<template>
  <form class="fx-page-stack" @submit.prevent="submit">
    <UAlert
      v-if="pendingInput"
      title="Previous submission awaiting confirmation"
      description="Retry with the original details to recover the same request. This will not create a second request."
    />
    <UButton
      v-if="pendingInput"
      type="button"
      variant="outline"
      :disabled="busy"
      @click="restoreSubmission"
      >Restore submitted details</UButton
    >
    <UFormField label="Your name" required
      ><UInput v-model="form.name" required maxlength="120"
    /></UFormField>
    <UFormField label="Email" required
      ><UInput v-model="form.email" type="email" required maxlength="320"
    /></UFormField>
    <UFormField label="Venue name" required
      ><UInput v-model="form.venue" required maxlength="200"
    /></UFormField>
    <UFormField label="Location" required
      ><UInput v-model="form.location" required maxlength="300"
    /></UFormField>
    <UFormField
      label="Menu source link"
      description="Paste a menu, PDF or photo link. You can upload files after submitting."
      ><UInput v-model="form.sourceUrl" type="url" maxlength="2000"
    /></UFormField>
    <UFormField label="Instructions"
      ><UTextarea v-model="form.instructions" maxlength="2000"
    /></UFormField>
    <UCheckbox
      v-if="localDevelopment"
      v-model="form.demo"
      label="Labelled demo request — requires a signed-in Misebox operator"
    />
    <UAlert
      v-if="error"
      color="error"
      title="Request not submitted"
      :description="error"
    />
    <UButton type="submit" :loading="busy">Submit menu request</UButton>
    <p>
      Submitting a request does not charge you. Price and delivery terms are
      agreed before purchase.
    </p>
  </form>
</template>
<script setup lang="ts">
import { useMenuExpressIntake } from '../../composables/useMenuExpressIntake'
const {
  localDevelopment,
  form,
  busy,
  error,
  pendingInput,
  restoreSubmission,
  submit,
} = useMenuExpressIntake()
</script>
