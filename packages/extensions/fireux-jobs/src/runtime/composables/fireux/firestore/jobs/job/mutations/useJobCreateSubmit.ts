import { useJobCreate } from './useJobCreate'
import {
  toJobPayload,
  useJobCreateState,
  validateJobDraft,
} from '../state/useJobCreateState'

export function useJobCreateSubmit() {
  const { createJob } = useJobCreate()

  const submit = async () => {
    const { jobDraft } = useJobCreateState()
    const error = validateJobDraft(jobDraft.value)
    if (error) throw new Error(error)

    const payload = toJobPayload(jobDraft.value)
    const id = await createJob(payload)
    return id
  }

  return { submit }
}
