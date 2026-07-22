<!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: provide one quiet staged-flow shell for domain funnels. -->
<template>
  <section
    :data-onboarding-family="family"
    :data-onboarding-step="stepId || undefined"
  >
    <MoleculesCreateCard>
      <template #header>
        <div class="form-stack-sm">
          <div>
            <div>
              <UBadge color="neutral" variant="soft">
                {{ stepNumber }} of {{ stepCount }}
              </UBadge>
            </div>
            <div><strong>{{ title }}</strong></div>
          </div>
          <UProgress :model-value="progress" :max="100" />
        </div>
      </template>

      <slot />

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Unable to continue"
        :description="error"
      />

      <template #footer>
        <UFieldGroup>
          <UButton
            v-if="showBack"
            type="button"
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
            :disabled="pending"
            @click="emit('back')"
          >
            {{ backLabel }}
          </UButton>
          <UButton
            type="button"
            color="primary"
            :icon="continueIcon"
            :loading="pending"
            :disabled="continueDisabled"
            @click="emit('continue')"
          >
            {{ continueLabel }}
          </UButton>
        </UFieldGroup>
      </template>
    </MoleculesCreateCard>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  family: string
  stepId?: string | null
  title: string
  stepNumber: number
  stepCount: number
  progress: number
  error?: string
  pending?: boolean
  showBack?: boolean
  backLabel?: string
  continueLabel?: string
  continueIcon?: string
  continueDisabled?: boolean
}>(), {
  stepId: null,
  error: '',
  pending: false,
  showBack: false,
  backLabel: 'Back',
  continueLabel: 'Continue',
  continueIcon: 'i-lucide-arrow-right',
  continueDisabled: false,
})

const emit = defineEmits<{
  back: []
  continue: []
}>()
</script>
