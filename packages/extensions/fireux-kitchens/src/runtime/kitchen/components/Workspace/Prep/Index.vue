<template>
  <section class="space-y-6">
    <UPageHeader :title="current.title" :description="current.description" />
    <UCard>
      <div class="flex items-start gap-4">
        <UIcon :name="current.icon" class="size-8 shrink-0 text-primary" />
        <div class="space-y-2">
          <UBadge color="warning" variant="subtle">Coming soon</UBadge>
          <h2 class="font-semibold">{{ current.empty }}</h2>
          <p class="text-sm text-muted">{{ current.next }}</p>
        </div>
      </div>
    </UCard>
    <UButton
      to="/workspace/kitchen/food/recipes"
      label="Open recipes"
      icon="i-lucide-notebook-tabs"
      color="neutral"
      variant="soft"
    />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(
  defineProps<{ view?: 'plan' | 'batches' }>(),
  { view: 'plan' }
)
const views = {
  plan: {
    title: 'Prep plan',
    description: 'Know what needs making before service starts.',
    icon: 'i-lucide-clipboard-list',
    empty: 'Prep planning is not connected yet',
    next: 'This view will bring together quantities, deadlines and the person responsible. Recipe definitions are available now; daily prep assignments are not.',
  },
  batches: {
    title: 'Batches',
    description: 'Record what was made, how much and when.',
    icon: 'i-lucide-cooking-pot',
    empty: 'Batch records are not connected yet',
    next: 'Actual production, yields and traceability will appear here. Recipe quantities alone do not count as completed production.',
  },
}
const current = computed(() => views[props.view] || views.plan)
</script>
