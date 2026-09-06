<template>
  <div v-if="openPlan && bare"><slot name="body" /><slot name="footer" /></div>
  <UCard v-else-if="openPlan" class="my-4">
    <template v-if="title || description" #header>
      <h3 class="font-semibold">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-muted">
        {{ description }}
      </p>
    </template>
    <slot name="body" />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </UCard>
  <UModal v-else v-bind="$attrs" :title="title" :description="description">
    <template v-for="(_, name) in $slots" #[name]="scope"
      ><slot :name="name" v-bind="scope || {}"
    /></template>
  </UModal>
</template>
<script setup lang="ts">
import { inject } from 'vue'
defineOptions({ inheritAttrs: false })
defineProps<{ title?: string; description?: string; bare?: boolean }>()
const openPlan = inject('workspace-team-open-plan', false)
</script>
