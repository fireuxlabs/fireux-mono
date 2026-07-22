<template>
  <!-- Concurrent edit — 2026-07-21 16:26 CEST — Place onboarding enrichment: confirm inherited Place currency and timezone defaults. -->
  <!-- Concurrent edit — 2026-07-21 16:32 CEST — Place onboarding completion: distinguish reuse-only Places from incomplete configurable Places. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: ask only for missing Place defaults. -->
  <section class="form-stack-sm">
    <UAlert
      v-if="locked"
      color="neutral"
      variant="soft"
      icon="i-lucide-lock-keyhole"
      title="Existing Place defaults"
      description="This Place will be reused without overwriting its currency or timezone."
    />

    <UFormField label="Currency" name="currency">
      <UInput
        :model-value="currencyCode"
        placeholder="CHF"
        :maxlength="3"
        autocomplete="off"
        :disabled="locked"
        @update:model-value="onCurrencyInput"
      />
    </UFormField>

    <UFormField label="Timezone" name="timezone">
      <UInput
        :model-value="timezone"
        placeholder="Europe/Zurich"
        :maxlength="80"
        autocomplete="off"
        :spellcheck="false"
        :disabled="locked"
        @update:model-value="onTimezoneInput"
      />
    </UFormField>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  currencyCode: string
  timezone: string
  locked: boolean
}>()

const emit = defineEmits<{
  (event: 'update:currencyCode', value: string): void
  (event: 'update:timezone', value: string): void
}>()

function onCurrencyInput(value: string | number) {
  const currencyCode = String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)

  emit('update:currencyCode', currencyCode)
}

function onTimezoneInput(value: string | number) {
  emit('update:timezone', String(value ?? ''))
}
</script>
