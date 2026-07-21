// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: route Company materialization through its authenticated server boundary.
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { CompanyCreateInput } from 'fireux-companies/runtime/models/company.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'

export const CompanyPayload = {
  id: '',
}

export const CompanyStampOptions = {
  creator: false,
} as const

export function useCompanyCreate() {
  async function createCompany(
    input: CompanyCreateInput & { place?: PlaceUpsertInput }
  ): Promise<string> {
    if (!input?.id) {
      throw new Error('Company id is required')
    }

    const id = String(input.id).trim()
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{ ok: boolean; id: string; created: boolean }>(
      '/api/companies/materialize',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { id },
      }
    )
    if (
      result?.ok !== true ||
      result.id !== id ||
      typeof result.created !== 'boolean'
    ) {
      throw new Error('[useCompanyCreate] Company materialization response was invalid.')
    }

    return id
  }

  return { createCompany }
}
