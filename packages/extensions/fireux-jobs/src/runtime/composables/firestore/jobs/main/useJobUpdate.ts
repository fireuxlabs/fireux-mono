import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { computed, type Ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { Job, JobStatus } from '../../../../types/job.model.ts'

export function useJobUpdate(jobRef: Ref<Job | null>) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const ensureDoc = () => {
    const id = jobRef.value?.id
    if (!appId || !id) {
      throw new Error('[useJobUpdate] Missing appId or job id')
    }
    return doc(db, 'apps', appId, 'jobs', id)
  }

  const setTitle = async (title: string) => {
    const target = ensureDoc()
    await updateDoc(target, {
      title: String(title ?? '').trim(),
      updated_at: serverTimestamp(),
    })
  }

  const setDescription = async (description: string | null) => {
    const target = ensureDoc()
    const value = String(description ?? '').trim()
    await updateDoc(target, {
      description: value.length ? value : null,
      updated_at: serverTimestamp(),
    })
  }

  const setPay = async (pay: string | number | null) => {
    const target = ensureDoc()
    const value = pay === '' ? null : pay
    await updateDoc(target, {
      pay: value ?? null,
      updated_at: serverTimestamp(),
    })
  }

  const setStatus = async (status: JobStatus) => {
    const target = ensureDoc()
    await updateDoc(target, {
      status,
      updated_at: serverTimestamp(),
    })
  }

  const isInitialized = computed(() => jobRef.value !== undefined)

  return { setTitle, setDescription, setPay, setStatus, isInitialized }
}
