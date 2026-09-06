import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectWorkspace } from 'fireux-core/runtime/project/composables/workspace/core/useProjectWorkspace'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

export function useProjectTest() {
  const workspace = useProjectWorkspace()
  const { currentUser } = useAuth()
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
  })
  const records = firestoreFetchCollection<{ id: string; value: string }>(
    computed(() =>
      workspace.id.value ? `projects/${workspace.id.value}/tests` : ''
    )
  )
  const pending = computed(() => records.value === undefined)
  const error = records.error
  async function write(
    method: 'POST' | 'PATCH' | 'DELETE',
    id = '',
    value = ''
  ) {
    const user = currentUser.value
    if (!user || !workspace.id.value)
      throw new Error('Select a Project and sign in.')
    const endpoint = `/api/internal/control/projects/${encodeURIComponent(workspace.id.value)}/tests`
    await $fetch(id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint, {
      method,
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
      body: { value },
      retry: 0,
      timeout: 20_000,
    })
  }
  return {
    id: workspace.id,
    records,
    pending,
    error,
    create: (value: string) => write('POST', '', value),
    update: (id: string, value: string) => write('PATCH', id, value),
    remove: (id: string) => write('DELETE', id),
  }
}
