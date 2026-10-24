<template>
  <form class="grid gap-3" @submit.prevent="submit">
    <UFormField label="Project name">
      <UInput
        v-model="name"
        name="project-name"
        placeholder="Project name"
        maxlength="120"
        :disabled="pending"
      />
    </UFormField>
    <UButton
      type="submit"
      icon="i-lucide-plus"
      :loading="pending"
      label="Create Project"
    />
    <UAlert
      v-if="formError || error"
      color="error"
      variant="soft"
      title="Project creation failed"
      :description="formError || error"
    />
    <MoleculesCopyError
      v-if="formError || error"
      :message="formError || error"
    />
  </form>
</template>

<script setup lang="ts">
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { ref } from 'vue'
import { useRoute } from '#imports'
import { useProjectCreate } from '../../../composables/useProjectCreate'

const emit = defineEmits<{
  (event: 'created'): void
}>()
const name = ref('')
const formError = ref('')
const { createProject, pending, error } = useProjectCreate()

const { currentUser } = useAuth()
const appSession = useAppSession()
const fireux = useFireUXConfig()
const route = useRoute()
const captureCommand = useCommandScope([
  name,
  currentUser,
  appSession.appUser,
  () => fireux.appId,
  () => route.fullPath,
])

async function submit() {
  if (pending.value) return
  const isCurrent = captureCommand()
  formError.value = ''
  const response = await createProject(name.value, { isCurrent }).catch(() => {
    if (isCurrent())
      formError.value = error.value || 'Project creation failed. Try again.'
    return null
  })
  if (!response || !isCurrent()) return
  name.value = ''
  emit('created')
}
</script>
