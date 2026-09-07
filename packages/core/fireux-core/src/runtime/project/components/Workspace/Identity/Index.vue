<template>
  <section class="workspace-surface">
    <WorkspaceProjectIdentityRead :identity="identity" />
    <UButton
      v-if="identity.canWrite.value"
      label="Edit Identity"
      icon="i-lucide-pencil"
      class="self-start"
      @click="editor?.show()"
    />
    <WorkspaceProjectIdentityWrite ref="editor" :identity="identity" />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectIdentityIntent } from '../../../models/identity-intent'
import WorkspaceProjectIdentityWrite from './Write.vue'
import type { ProjectIdentityState } from '../../../composables/useProjectIdentity'
defineProps<{ identity: ProjectIdentityState }>()
const editor = ref<InstanceType<typeof WorkspaceProjectIdentityWrite>>()
defineExpose({
  openAction: (intent: ProjectIdentityIntent) => {
    if (intent.action === 'update') editor.value?.show(intent)
  },
})
</script>
