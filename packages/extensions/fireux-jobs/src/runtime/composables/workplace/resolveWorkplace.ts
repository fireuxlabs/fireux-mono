import type { Kitchen } from 'fireux-kitchens/runtime/models/kitchen.model'
import type { Job } from '../../models/job.model'

export type WorkplaceRegistries = {
  kitchens?: Map<string, Kitchen>
}

export type WorkplaceMeta = {
  workplaceId: string
  workplaceType: string
  workplaceLabel: string
}

export function resolveWorkplaceMeta(job: Job): WorkplaceMeta {
  const workplaceId = String((job as any)?.workplace_id ?? '').trim()
  const workplaceType = String((job as any)?.workplace_type ?? '').trim()
  const workplaceLabel = String((job as any)?.workplace_label ?? '').trim()

  return { workplaceId, workplaceType, workplaceLabel }
}

export function resolveWorkplace(
  job: Job,
  registries: WorkplaceRegistries = {}
): Kitchen | unknown | null {
  const { workplaceId, workplaceType } = resolveWorkplaceMeta(job)

  if (workplaceType === 'kitchen') {
    if (registries.kitchens && workplaceId) {
      return registries.kitchens.get(workplaceId) ?? null
    }

    return (job as any)?.kitchen ?? null
  }

  return (job as any)?.workplace ?? null
}
