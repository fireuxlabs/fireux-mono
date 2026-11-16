<template>
  <section class="workspace-profile">
    <WorkspaceProjectIdentityRead :identity="identity" @edit="editor?.show()" />
    <WorkspaceProjectIdentityWrite ref="editor" :identity="identity" />
    <FireContextRecord
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
import type { ProjectWorkspaceIdentityState } from '../../../composables/workspace/useProjectWorkspaceIdentity'
defineProps<{ identity: ProjectWorkspaceIdentityState }>()
const editor = ref<InstanceType<typeof WorkspaceProjectIdentityWrite>>()
</script>
