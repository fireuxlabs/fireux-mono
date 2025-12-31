import type { Ref } from 'vue'
import type { Job } from '../../../../../../models/job.model'

export function useJobComputed(job: Ref<Job | null>, pending: Ref<boolean>) {
  // Stub: keep args for future use, avoid TS “unused” warnings
  void job
  void pending

  return {}
}
