// Concurrent edit — 2026-07-21 14:11 CEST — Werkbox Firebase hardening: expose only trusted Company materialization writes.
import { useCompanyCollection } from './fetch/useCompanyCollection'
import { useCompanyFetch } from './fetch/useCompanyFetch'
import { useCompanyCreate } from './mutations/useCompanyCreate'
import { useCompanySeo } from './utils/useCompanySeo'
import { useCompanyComputed } from './utils/view/useCompanyComputed'
import { useCompanyInterface } from './utils/view/useCompanyInterface'
import { CompanyStorage } from '../../../../models/company.model'

export {
  useCompanyCollection,
  useCompanyFetch,
  useCompanyCreate,
  useCompanySeo,
  useCompanyComputed,
  useCompanyInterface,
}

export interface UseCompanyOptions {
  collectionPath?: string
}

/**
 * FireUX stack family: Normal root entity.
 * Entity: Company.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * This file is the single Company family entry seam.
 * Singular/plural dimensions belong to useCompanyFetch/useCompanyCollection;
 * it should not invent active Company state.
 */
export function useCompany<
  T extends Record<string, any> = Record<string, any>,
>(options: UseCompanyOptions = {}) {
  return {
    ...useCompanyCollection<T>(options.collectionPath ?? CompanyStorage.collection),
    ...useCompanyFetch(),
    ...useCompanyCreate(),
    ...useCompanyComputed(),
    ...useCompanyInterface(),
    useCompanySeo,
  }
}
