<template>
  <UCard variant="subtle">
    <template #header>
      <div class="card__header">
        <div>
          <p>Employer flow</p>
          <h2 class="fx-type-card-heading">Post a job</h2>
        </div>
        <UBadge :color="published ? 'success' : 'primary'" variant="soft">
          {{ published ? 'Published' : `Step ${currentStep} of ${steps.length}` }}
        </UBadge>
      </div>
    </template>
    <UStepper
      :items="steps"
      :model-value="published ? steps.length : currentStep - 1"
      aria-label="Job publication progress"
      disabled
    />
  </UCard>
</template>

<script setup lang="ts">
withDefaults(
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
    title: 'Employer identity',
    description: 'Sign in and prepare your hiring profile for this App.',
  },
  {
    number: 2,
    title: 'Build the draft',
    description: 'Choose the Business, Place, role, schedule, and offer.',
  },
  {
    number: 3,
    title: 'Review and publish',
    description: 'Save the final details, then make the posting public.',
  },
] as const

</script>
