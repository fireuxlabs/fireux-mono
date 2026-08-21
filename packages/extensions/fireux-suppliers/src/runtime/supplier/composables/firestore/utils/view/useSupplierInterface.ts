// Concurrent edit — 2026-07-20 22:11 CEST — Both-Entity Authority — Supplier: compose root identity with allowlisted App access only.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name the allowlisted App access input directly.
import {
  csv,
  safeString,
  safeStringArray,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import {
  SupplierStorage,
  type Supplier,
} from '../../../../models/Supplier.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'

const supplierCollection = SupplierStorage.collection

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarUrl: string
    logoImageUrl: string
    placeImageUrl: string
    imageShade: Place['image_shade']
    title: string
    subtitle: string
    badges: string[]
    summary: string
    status: string
    shortName: string
    ownerLabel: string
    locationLabel: string
    headquartersLabel: string
    organizationName: string
    locationsLabel: string
    categoriesCsv?: string
  }
}

export type SupplierSurface = Partial<Supplier> & { company_place?: Place }
export type SupplierSurfaceParts<TSupplier extends object = Partial<Supplier>> =
  {
    supplier?: TSupplier | null | undefined
    companyPlace?: Place | null | undefined
  }

export function useSupplierInterface() {
  type SupplierIdentity = SupplierCard.Card
  type SupplierPill = SupplierCard.Card
  type SupplierCell = SupplierCard.Card
  type SupplierPreview = SupplierCard.Card
  type SupplierProfile = SupplierCard.Card

  function surface<TSupplier extends object = Partial<Supplier>>(
    parts: SupplierSurfaceParts<TSupplier>
  ): (TSupplier & SupplierSurface) | null {
    const source = parts.supplier ?? null
    if (!source) return null

    const {
      operator_ids: _rootOperatorIds,
      team_ids: _rootTeamIds,
      join_requests: _rootJoinRequests,
      company_place: _rootCompanyPlace,
      ...root
    } = source as Record<string, unknown>
    const companyPlace = parts.companyPlace ?? null
    if (companyPlace) {
      const companyId = safeString(root.company_id).trim()
      const placeId = safeString(companyPlace.id).trim()
      if (!companyId || companyId !== placeId) return null
    }
    const merged = {
      ...root,
      ...(companyPlace
        ? {
            company_place: { ...companyPlace },
          }
        : {}),
    } as TSupplier & SupplierSurface
    const id = safeString(merged.id).trim()
    if (!id) return null

    return {
      ...merged,
      id,
    }
  }

  function map(target: SupplierSurface): SupplierCard.Card {
    const id = safeString(target.id).trim()
    const slug = safeString(target.slug).trim()
    const organizationName = safeString(target.supplier_organization_name)
    const badges = safeStringArray(target.supplier_item_categories)
    const deliveryAreas = safeStringArray(target.supplier_delivery_areas)
    const headline = safeString(target.supplier_headline)
    const summary = safeString(target.summary)
    const logoImageUrl = safeString(target.supplier_image)
    const placeImageUrl = safeString(target.company_place?.image_url)
    const imageUrl = placeImageUrl || logoImageUrl
    const headquartersLabel =
      safeString(target.company_place?.short_address) ||
      safeString(target.company_place?.name)
    const categoriesCsv = csv(badges)
    const locationsLabel = deliveryAreas.join(', ')

    return {
      id,
      to: slug ? `/${supplierCollection}/${encodeURIComponent(slug)}` : '',
      imageUrl,
      avatarUrl: logoImageUrl || imageUrl,
      logoImageUrl,
      placeImageUrl,
      imageShade: target.company_place?.image_shade || 'none',
      title: organizationName,
      subtitle: headline,
      badges,
      organizationName,
      locationsLabel,
      summary,
      status: safeString(target.state),
      shortName: slug,
      ownerLabel: organizationName,
      locationLabel: headquartersLabel,
      headquartersLabel,
      categoriesCsv: categoriesCsv || undefined,
    }
  }

  function buildInterface(
    target?: SupplierSurface | null | undefined
  ): SupplierCard.Card | null {
    const source = target ?? null
    if (!source) return null

    const mapped = map(source)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function identity(
    target?: SupplierSurface | null | undefined
  ): SupplierIdentity | null {
    return buildInterface(target)
  }

  function pill(
    target?: SupplierSurface | null | undefined
  ): SupplierPill | null {
    return buildInterface(target)
  }

  function cell(
    target?: SupplierSurface | null | undefined
  ): SupplierCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: SupplierSurface | null | undefined
  ): SupplierPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: SupplierSurface | null | undefined
  ): SupplierProfile | null {
    return identity(target)
  }

  return {
    surface,
    interface: toInterface,
    identity,
    pill,
    cell,
    preview,
    profile,
  }
}
