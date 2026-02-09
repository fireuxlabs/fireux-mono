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
  const legacyKitchenId = String((job as any)?.kitchen_id ?? '').trim()
  const workplaceId = String((job as any)?.workplace_id ?? '').trim() || legacyKitchenId
  const workplaceType =
    String((job as any)?.workplace_type ?? '').trim() || (legacyKitchenId ? 'kitchen' : '')
  const workplaceLabel = String((job as any)?.workplace_label ?? '').trim()

  return { workplaceId, workplaceType, workplaceLabel }
}

export function resolveWorkplace(
  job: Job,
  registries: WorkplaceRegistries = {}
): Kitchen | unknown | null {
  const { workplaceId, workplaceType } = resolveWorkplaceMeta(job)
  const fallbackWorkplace = (job as any)?.workplace ?? null

  if (workplaceType === 'kitchen') {
    if (registries.kitchens && workplaceId) {
      return registries.kitchens.get(workplaceId) ?? null
    }

    const kitchen = (job as any)?.kitchen
    return kitchen ?? fallbackWorkplace
  }

  return fallbackWorkplace
}
