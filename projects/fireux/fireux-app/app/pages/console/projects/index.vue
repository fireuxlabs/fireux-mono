<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useRuntimeProjectSelection } from 'fireux-core/runtime/composables/fireux/app/runtime-project/state'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const { currentUser } = useUser()
const { firestoreFetchCollection } = useFirestoreRead()
const projects = firestoreFetchCollection<{ id?: string; owner_user_id?: string }>('projects')
const { runtimeProjectId, setRuntimeProject } = useRuntimeProjectSelection()

const deadline = Date.now() + 1500
while (projects.value === undefined && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 50))
}

const ownedProjects = (projects.value ?? []).filter(
  (entry) =>
    String((entry as any).owner_user_id || '').trim() ===
    String(currentUser.value?.id || '').trim()
)
const selectedId = String(runtimeProjectId.value || '').trim()
const fallbackId = String(ownedProjects[0]?.id || '').trim()
const resolvedId =
  ownedProjects.some((entry) => String((entry as any)?.id || '').trim() === selectedId)
    ? selectedId
    : fallbackId

if (!resolvedId) {
  await navigateTo('/console/projects/create', { replace: true })
} else {
  setRuntimeProject({ projectId: resolvedId, mode: 'live' })
  await navigateTo('/console/projects/overview', { replace: true })
}
</script>
