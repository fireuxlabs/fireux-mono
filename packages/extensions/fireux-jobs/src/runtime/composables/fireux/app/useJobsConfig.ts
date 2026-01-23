import { useRuntimeConfig } from '#imports'

export type JobsRuntimeConfig = {
  enabled?: boolean
  placeCollections?: string[]
}

export function useJobsConfig(): JobsRuntimeConfig & { placeCollections: string[] } {
  const runtimeConfig = useRuntimeConfig() as any
  const jobs = (runtimeConfig?.public as any)?.fireux?.jobs ?? {}
  const raw = jobs.placeCollections
  const placeCollections = Array.isArray(raw) && raw.length
    ? raw.map((value: unknown) => String(value))
    : ['places']

  return {
    ...jobs,
    placeCollections,
  }
}
