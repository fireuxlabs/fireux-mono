<template>
  <section class="space-y-4" aria-labelledby="auth-onboarding-title">
    <div class="space-y-1">
      <h2 id="auth-onboarding-title" class="font-semibold">
        {{ title }}
      </h2>
      <p v-if="description" class="text-sm text-muted">
        {{ description }}
      </p>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Registrierig het nid klappt"
      :description="error"
    />

    <div class="flex flex-col gap-3">
      <UButton
        block
        color="primary"
        :loading="loading === 'completed'"
        :disabled="Boolean(loading)"
        @click="$emit('submit', 'completed')"
      >
        {{ completeLabel }}
      </UButton>
      <UButton
        block
        variant="ghost"
        :loading="loading === 'skipped'"
        :disabled="Boolean(loading)"
        @click="$emit('submit', 'skipped')"
      >
        {{ skipLabel }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  completeLabel?: string
  skipLabel?: string
  loading?: '' | 'completed' | 'skipped'
  error?: string
}>(), {
  description: '',
  completeLabel: 'Complete registration',
  skipLabel: 'Skip for now',
  loading: '',
  error: '',
})

defineEmits<{
  submit: [status: 'completed' | 'skipped']
}>()
</script>
