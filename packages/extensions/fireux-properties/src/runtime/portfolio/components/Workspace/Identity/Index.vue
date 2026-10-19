<template>
  <section class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <WorkspacePortfolioIdentityRead :identity="identity">
      <template #actions>
        <UButton
          v-if="identity.canWrite.value"
          label="Edit profile"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          @click="openEditor('profile')"
        />
      </template>
      <template #context-actions
        ><UButton
          v-if="identity.canWrite.value"
          label="Edit context"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          @click="openEditor('context')"
      /></template>
    </WorkspacePortfolioIdentityRead>
    <USlideover
      v-model:open="open"
      :title="
        editorSection === 'profile' ? 'Portfolio profile' : 'Internal context'
      "
    >
      <template #body>
        <WorkspacePortfolioIdentityEdit
          v-if="open && identity.canWrite.value"
          :key="identity.portfolioId.value"
          :identity="identity"
          :section="editorSection"
        />
      </template>
    </USlideover>
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePortfolioIdentity } from '../../../composables/usePortfolioIdentity'
const identity = usePortfolioIdentity()
const { currentUser } = useAuth()
const open = ref(false)
const editorSection = ref<'profile' | 'context'>('profile')
function openEditor(section: 'profile' | 'context') {
  editorSection.value = section
  open.value = true
}
watch(
  [() => currentUser.value?.uid, identity.portfolioId, identity.canWrite],
  () => {
    open.value = false
  },
  { flush: 'sync' }
)
</script>
