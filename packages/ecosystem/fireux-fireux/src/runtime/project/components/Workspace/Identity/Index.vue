<template>
  <section class="workspace-surface">
    <WorkspaceProjectIdentityRead :identity="identity">
      <template #actions>
        <UButton
          v-if="identity.canWrite.value"
          label="Edit Identity"
          icon="i-lucide-pencil"
          @click="editor?.show()"
        />
      </template>
    </WorkspaceProjectIdentityRead>
    <WorkspaceProjectIdentityWrite ref="editor" :identity="identity" />
    <ContextRecord
      v-if="identity.canWrite.value"
      :key="identity.projectId.value"
      title="Project AI context"
      endpoint="/api/internal/control/project-context"
      :scope="{ projectId: identity.projectId.value }"
    />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceProjectIdentityWrite from './Write.vue'
import type { ProjectIdentityState } from '../../../composables/useProjectIdentity'
defineProps<{ identity: ProjectIdentityState }>()
const editor = ref<InstanceType<typeof WorkspaceProjectIdentityWrite>>()
</script>
