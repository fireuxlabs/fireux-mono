import { useEcosystemRead } from '../../useEcosystemRead'

export function useEcosystemFetch(id: string | { value: string }) {
  return useEcosystemRead(id)
}
