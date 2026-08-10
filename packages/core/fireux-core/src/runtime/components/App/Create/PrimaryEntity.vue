<template>
  <div class="space-y-6">
    <section class="space-y-3">
      <div>
        <h2 class="font-semibold text-highlighted">What will it run?</h2>
        <p class="mt-1 text-sm text-muted">
          Choose an ordinary App or attach it to one canonical domain entity.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          class="rounded-lg border p-4 text-left transition"
          :class="cardClass(selected && !family)"
          @click="$emit('select', '')"
        >
          <UIcon name="i-lucide-app-window" class="mb-3 size-5 text-primary" />
          <span class="block font-medium text-highlighted">General App</span>
          <span class="mt-1 block text-sm text-muted">
            An App without a required primary domain entity.
          </span>
        </button>

        <button
          v-for="option in options"
          :key="option.family"
          type="button"
          class="rounded-lg border p-4 text-left transition"
          :class="cardClass(family === option.family)"
          @click="$emit('select', option.family)"
        >
          <UIcon name="i-lucide-box" class="mb-3 size-5 text-primary" />
          <span class="block font-medium text-highlighted">{{ option.label }}</span>
          <span class="mt-1 block text-sm text-muted">{{ option.description }}</span>
        </button>
      </div>
    </section>

    <UCard v-if="current">
      <template #header>
        <div>
          <h2 class="font-semibold text-highlighted">Primary entity</h2>
          <p class="mt-1 text-sm text-muted">
            The canonical root must exist before the App can be provisioned.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField
          :label="`${current.label} id`"
          name="primary_entity_id"
          description="Use an existing canonical root, or create one first. App support is attached later."
          required
        >
          <UInput
            :model-value="entityId"
            class="w-full"
            placeholder="Canonical entity id"
            @update:model-value="$emit('update:entityId', String($event || ''))"
          />
        </UFormField>
        <UButton
          :to="onboardingTo"
          color="neutral"
          variant="soft"
          icon="i-lucide-external-link"
        >
          Create or choose {{ current.label }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppOnboardingPrimaryEntityOption } from '../../../models/operations/app-onboarding'

const props = defineProps<{
  options: AppOnboardingPrimaryEntityOption[]
  selected: boolean
  family: string
  entityId: string
}>()

defineEmits<{
  select: [family: string]
  'update:entityId': [value: string]
}>()

const current = computed(() =>
  props.options.find(option => option.family === props.family)
)
const onboardingTo = computed(() => {
  if (!current.value) return '/apps/create'
  const query = new URLSearchParams({
    returnTo: '/apps/create',
    returnEntityFamily: current.value.family,
  })
  return `${current.value.root_onboarding_path}?${query.toString()}`
})

const cardClass = (active: boolean) =>
  active
    ? 'border-primary bg-primary/5 ring-1 ring-primary'
    : 'border-default bg-default hover:border-accented'
</script>
