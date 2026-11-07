<template>
  <section class="workspace-profile">
    <ProjectIdentityRead :identity="identity" @edit="editor?.show()" />
    <ProjectIdentityWrite ref="editor" :identity="identity" />
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
import ProjectIdentityWrite from './Write.vue'
import type { ProjectWorkspaceIdentityState } from '../../composables/workspace/useProjectWorkspaceIdentity'
defineProps<{ identity: ProjectWorkspaceIdentityState }>()
const editor = ref<InstanceType<typeof ProjectIdentityWrite>>()
</script>
