import {
  csv,
  safeString,
  safeStringArray,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import {
  SupplierStorage,
  type AppSupplier,
  type Supplier,
} from '../../../../../../models/supplier/Supplier.model'
import type { Ref } from 'vue'

const supplierCollection = SupplierStorage.rootCollection

type SupplierRootAndOverlay = {
  coreSupplier: Ref<Supplier | null | undefined>
  appSupplier: Ref<AppSupplier | null | undefined>
}

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    avatarUrl: string
    title: string
    subtitle: string
    badges: string[]
    summary: string
    status: string
    shortName: string
    ownerLabel: string
    locationLabel: string
    organizationName: string
    locationsLabel: string
    categoriesCsv?: string
  }
}

export type SupplierSurface = Partial<Supplier>
export type SupplierSurfaceParts<TSupplier extends object = Partial<Supplier>> = {
  supplier?: TSupplier | null | undefined
  overlay?: Record<string, unknown> | null | undefined
}

export function useSupplierInterface(supplier?: SupplierRootAndOverlay | null) {
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

    const merged = {
      ...source,
      ...(parts.overlay ?? {}),
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
    const imageUrl = safeString(target.supplier_image)
    const categoriesCsv = csv(badges)
    const locationsLabel = deliveryAreas.join(', ')

    return {
      id,
      to: slug ? `/${supplierCollection}/${encodeURIComponent(slug)}` : '',
      imageUrl,
      avatarUrl: imageUrl,
      title: organizationName,
      subtitle: headline,
      badges,
      organizationName,
      locationsLabel,
      summary,
      status: safeString(target.state),
      shortName: slug,
      ownerLabel: organizationName,
      locationLabel: locationsLabel,
      categoriesCsv: categoriesCsv || undefined,
    }
  }

  function buildInterface(
    target?: SupplierSurface | null | undefined
  ): SupplierCard.Card | null {
    const source = target ?? supplier?.coreSupplier.value ?? null
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
