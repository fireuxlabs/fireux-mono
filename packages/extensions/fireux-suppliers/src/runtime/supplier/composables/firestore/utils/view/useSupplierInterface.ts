import { normalizeSupplier } from '../../../../utils/normalize-supplier'
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
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'

const supplierCollection = SupplierStorage.collection

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarUrl: string
    logoImageUrl: string
    placeImageUrl: string
    imageShade: PlaceImageShade
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

export type SupplierSurface = Supplier & { company_place?: Place }
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

    const { company_place: _companyPlace, ...body } = source as Record<
      string,
      unknown
    >
    const root = normalizeSupplier(body.id, body)
    if (!root) return null
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
    const slug = safeString(target.identity?.slug).trim()
    const organizationName =
      safeString(target.company_place?.short_name) ||
      safeString(target.company_place?.name)
    const deliveryAreas = safeStringArray(target.delivery?.areas)
    const badges = deliveryAreas
    const headline = safeString(target.company_place?.tagline)
    const summary = safeString(target.company_place?.about)
    const logoImageUrl = safeString(target.company_place?.logo_image)
    const placeImageUrl = safeString(target.company_place?.image_url)
    const imageUrl = placeImageUrl || logoImageUrl
    const headquartersLabel =
      safeString(target.company_place?.short_address) ||
      safeString(target.company_place?.name)
    const categoriesCsv = csv(badges)
    const locationsLabel = deliveryAreas.join(', ')

    return {
      id,
      to: id ? `/${supplierCollection}/${encodeURIComponent(id)}` : '',
      imageUrl,
      avatarUrl: logoImageUrl || imageUrl,
      logoImageUrl,
      placeImageUrl,
      imageShade: 'none',
      title: organizationName,
      subtitle: headline,
      badges,
      organizationName,
      locationsLabel,
      summary,
      status: safeString(target.identity?.status),
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
