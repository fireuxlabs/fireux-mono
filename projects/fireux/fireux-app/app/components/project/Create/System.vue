<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Project details</div>
        <div class="text-xs text-dimmed">
          Projects group apps, ecosystems, and project-level operations.
        </div>
      </div>
    </template>

    <ProjectCreateForm
      :return-to="returnTo"
      :cancel-to="cancelTo"
      @created="$emit('created', $event)"
    />
  </UCard>
</template>

<script setup lang="ts">

defineProps<{
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', projectId: string): void
}>()
</script>
