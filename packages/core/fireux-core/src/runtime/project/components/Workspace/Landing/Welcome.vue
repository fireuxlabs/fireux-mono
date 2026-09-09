<template>
  <WorkspaceGettingStarted
    title="Start with your next Project"
    description="Give your work a home. Add a Project, shape its identity and bring your team together. You can explore existing Apps and Ecosystems before you begin."
    icon="i-lucide-briefcase-business"
  >
    <template #actions>
      <UButton
        v-if="canCreate"
        label="Create your Project"
        icon="i-lucide-plus"
        @click="emit('create')"
      />
      <UButton
        v-else-if="!signedIn"
        to="/auth"
        label="Sign in to create a Project"
        icon="i-lucide-log-in"
      />
      <p v-else class="text-sm text-muted">{{ creationReason }}</p>
    </template>
  </WorkspaceGettingStarted>
</template>
<script setup lang="ts">
import WorkspaceGettingStarted from '../../../../components/Workspace/GettingStarted.vue'
defineProps<{ canCreate: boolean; signedIn: boolean; creationReason: string }>()
const emit = defineEmits<{ create: [] }>()
</script>
