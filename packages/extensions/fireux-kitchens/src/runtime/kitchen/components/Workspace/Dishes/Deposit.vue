<template>
  <section class="mt-5 space-y-2 border-t border-default pt-5">
    <MoleculesFormsEditableSimpleField
      :key="value || 0"
      :label="`Bottle deposit (${currency})`"
      type="number"
      :value="String(value || 0)"
      :disabled="disabled"
      :capture-intent="captureIntent"
      :validation-function="validate"
      :update="update"
    />
    <p class="text-sm text-muted">
      Set 0 for no deposit. Takeaway customers choose a new bottle with this
      deposit or exchange a matching bottle. The drink price stays unchanged.
    </p>
  </section>
</template>
<script setup lang="ts">
defineProps<{
  value?: number
  currency: string
  disabled: boolean
  captureIntent: () => () => boolean
  update: (value: string) => Promise<void>
}>()
function validate(value: string) {
  const amount = Number(value)
  const isValid =
    Boolean(value.trim()) && Number.isFinite(amount) && amount >= 0
  return {
    isValid,
    message: isValid ? '' : 'Enter a non-negative deposit, or 0 for none.',
  }
}
</script>
