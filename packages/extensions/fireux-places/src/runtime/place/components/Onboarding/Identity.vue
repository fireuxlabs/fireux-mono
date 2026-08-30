<template>
  <section class="form-stack-sm">
    <UAlert
      color="primary"
      variant="soft"
      icon="i-lucide-sparkles"
      title="AI-assisted starting point"
      description="These suggestions use the confirmed Place facts. Review and edit them before saving."
    />

    <UFormField label="Short name" required>
      <UInput
        :model-value="shortName"
        maxlength="80"
        class="w-full"
        @update:model-value="emit('update:shortName', String($event || ''))"
      />
    </UFormField>

    <UFormField label="Tagline" hint="Optional">
      <UTextarea
        :model-value="tagline"
        maxlength="180"
        :rows="3"
        class="w-full"
        @update:model-value="emit('update:tagline', String($event || ''))"
      />
    </UFormField>
  </section>
</template>

<script setup lang="ts">
defineProps<{ shortName: string; tagline: string }>()

const emit = defineEmits<{
  (event: 'update:shortName', value: string): void
  (event: 'update:tagline', value: string): void
}>()
</script>
