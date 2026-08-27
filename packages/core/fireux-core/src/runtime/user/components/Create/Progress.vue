<template>
  <div
    class="mb-6 flex items-center justify-center gap-2"
    aria-label="Account setup progress"
  >
    <template v-for="(step, index) in steps" :key="step.label">
      <div class="flex items-center gap-2">
        <span
          class="flex size-8 items-center justify-center rounded-full border text-sm font-semibold"
          :class="stepClass(Number(index))"
        >
          <UIcon
            v-if="Number(index) < activeStep"
            name="i-lucide-check"
            class="size-4"
          />
          <span v-else>{{ Number(index) + 1 }}</span>
        </span>
        <span
          class="hidden text-sm font-medium sm:inline"
          :class="Number(index) <= activeStep ? 'text-highlighted' : 'text-muted'"
        >
          {{ step.label }}
        </span>
      </div>
      <span
        v-if="Number(index) < steps.length - 1"
        class="h-px w-8 bg-border sm:w-14"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  steps: Array<{ label: string }>
  activeStep: number
}>()

function stepClass(index: number) {
  if (index < props.activeStep)
    return 'border-success bg-success text-inverted'
  if (index === props.activeStep)
    return 'border-primary bg-primary text-inverted'
  return 'border-default bg-default text-muted'
}
</script>
