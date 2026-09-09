<template>
  <WorkspaceGettingStarted
    title="Make room for your Kitchen"
    description="Find your venue first. If it already exists, continue with that Kitchen; otherwise set up a new one. Your menus, people and daily work will live together here."
    icon="i-lucide-chef-hat"
  >
    <template #actions>
      <UButton
        v-if="canCreate"
        label="Add your Kitchen"
        icon="i-lucide-plus"
        @click="emit('create')"
      />
      <UButton
        v-else-if="!signedIn"
        to="/auth"
        label="Sign in to add your Kitchen"
        icon="i-lucide-log-in"
      />
      <p v-else class="text-sm text-muted">{{ creationReason }}</p>
      <UButton
        to="/kitchens"
        label="Explore Kitchens"
        color="neutral"
        variant="ghost"
        trailing-icon="i-lucide-arrow-up-right"
      />
    </template>
  </WorkspaceGettingStarted>
</template>
<script setup lang="ts">
import WorkspaceGettingStarted from 'fireux-core/runtime/components/Workspace/GettingStarted.vue'
defineProps<{ canCreate: boolean; signedIn: boolean; creationReason: string }>()
const emit = defineEmits<{ create: [] }>()
</script>
