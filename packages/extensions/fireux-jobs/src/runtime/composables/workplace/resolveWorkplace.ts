// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: resolve product-neutral workplace registries.
import type { Job } from '../../models/job.model'

export type WorkplaceRegistries = Record<
  string,
  Map<string, unknown> | undefined
>

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
): unknown | null {
  const { workplaceId, workplaceType } = resolveWorkplaceMeta(job)
  const registry = workplaceType ? registries[workplaceType] : undefined

  if (registry && workplaceId) {
    return registry.get(workplaceId) ?? null
  }

  return (job as any)?.workplace ?? null
}
