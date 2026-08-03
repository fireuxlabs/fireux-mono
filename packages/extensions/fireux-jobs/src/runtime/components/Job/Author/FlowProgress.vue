<template>
  <UCard variant="subtle">
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-widest text-primary"
          >
            Employer flow
          </p>
          <h2 class="mt-1 text-lg font-semibold text-highlighted">
            Post a job
          </h2>
        </div>
        <UBadge :color="published ? 'success' : 'primary'" variant="soft">
          {{
            published ? 'Published' : `Step ${currentStep} of ${steps.length}`
          }}
        </UBadge>
      </div>

      <ol class="grid gap-3 md:grid-cols-3">
        <li
          v-for="step in steps"
          :key="step.number"
          class="rounded-2xl border p-4 transition-colors"
          :class="stepClass(step.number)"
        >
          <div class="flex items-start gap-3">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
              :class="numberClass(step.number)"
            >
              <UIcon
                v-if="isComplete(step.number)"
                name="i-lucide-check"
                class="size-4"
              />
              <span v-else>{{ step.number }}</span>
            </span>
            <div>
              <p class="text-sm font-semibold text-highlighted">
                {{ step.label }}
              </p>
              <p class="mt-1 text-xs leading-5 text-muted">
                {{ step.description }}
              </p>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentStep?: 1 | 2 | 3
    published?: boolean
  }>(),
  {
    currentStep: 1,
    published: false,
  }
)

const steps = [
  {
    number: 1,
    label: 'Employer identity',
    description: 'Sign in and prepare your hiring profile for this App.',
  },
  {
    number: 2,
    label: 'Build the draft',
    description: 'Choose the Company, Place, role, schedule, and offer.',
  },
  {
    number: 3,
    label: 'Review and publish',
    description: 'Save the final details, then make the posting public.',
  },
] as const

const isComplete = (step: number) => props.published || step < props.currentStep
const isActive = (step: number) =>
  !props.published && step === props.currentStep
const stepClass = (step: number) => {
  if (isComplete(step)) return 'border-success/30 bg-success/5'
  if (isActive(step)) return 'border-primary/40 bg-primary/5'
  return 'border-default bg-default/40'
}
const numberClass = (step: number) => {
  if (isComplete(step)) return 'border-success bg-success text-inverted'
  if (isActive(step)) return 'border-primary bg-primary text-inverted'
  return 'border-default bg-muted text-muted'
}
</script>
