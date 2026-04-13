import {
  csv,
  firstNonEmptyString,
  resolveProfileBadges,
  resolveProfileImage,
  resolveProfileSummary,
  safeString,
  safeStringArray,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import type { Supplier } from '../../../../../../models/supplier/Supplier.model'
import type { SupplierRefs } from '../../fetch/useSupplierRecord'

const supplierCollection = 'suppliers'
const DEFAULT_SUPPLIER_IMAGE = '/img/core/brand/logo.png'
type UserLike = Pick<User, 'avatar'>
type SupplierTarget = SupplierSurface & { user?: UserLike | null }

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

export type SupplierSurface = Partial<Supplier> & {
  supplier_id?: string
  source_supplier_id?: string
  name?: string
  short_name?: string
  category?: string
  image?: string
  image_url?: string
  logo_url?: string
  avatar_url?: string
}

const firstArrayValue = (value: unknown): string =>
  firstNonEmptyString(Array.isArray(value) ? value : [])

export function useSupplierInterface(
  supplier?: SupplierRefs | null,
  userRef?: Ref<User | null | undefined>
) {
  type SupplierPill = SupplierCard.Card
  type SupplierCell = SupplierCard.Card
  type SupplierPreview = SupplierCard.Card
  type SupplierProfile = SupplierCard.Card

  function resolveUser(
    target?: SupplierTarget | null | undefined,
    userOverride?: UserLike | null
  ): UserLike | null {
    if (userOverride) return userOverride
    if (target && 'user' in target && target.user) return target.user
    return userRef?.value ?? null
  }

  function map(target: SupplierSurface, user?: UserLike | null): SupplierCard.Card {
    const id = firstNonEmptyString([target.supplier_id, target.source_supplier_id, target.id])
    const organizationName = firstNonEmptyString([
      target.supplier_organization_name,
      target.name,
      target.short_name,
      id,
    ])
    const badges = resolveProfileBadges([target.supplier_product_categories])
    const deliveryAreas = safeStringArray(target.supplier_delivery_areas)
    const headline = firstNonEmptyString([target.supplier_headline])
    const summary = resolveProfileSummary([
      target.summary,
      target.supplier_bio,
    ])
    const primaryAvatar = resolveProfileImage([
      target.image,
      target.supplier_image,
      target.image_url,
      target.logo_url,
      target.avatar_url,
      user?.avatar,
    ]) || DEFAULT_SUPPLIER_IMAGE
    const categoriesCsv = csv(badges)
    const locationsLabel = deliveryAreas.join(', ')
    const categoryLabel = firstNonEmptyString([
      target.category,
      firstArrayValue(target.supplier_product_categories),
    ])
    const title = firstNonEmptyString([organizationName, id])
    const subtitle = firstNonEmptyString([headline, locationsLabel, categoryLabel])

    return {
      id,
      to: id ? `/${supplierCollection}/${encodeURIComponent(id)}` : '',
      imageUrl: primaryAvatar,
      avatarUrl: primaryAvatar,
      title,
      subtitle,
      badges,
      organizationName,
      locationsLabel,
      summary,
      status: '',
      shortName: safeString(target.short_name),
      ownerLabel: organizationName,
      locationLabel: locationsLabel,
      categoriesCsv: categoriesCsv || undefined,
    }
  }

  function buildInterface(
    target?: SupplierSurface | null | undefined,
    userOverride?: UserLike | null
  ): SupplierCard.Card | null {
    const source = target ?? supplier?.coreSupplier.value ?? null
    if (!source) return null

    const mapped = map(source, resolveUser(source as SupplierTarget, userOverride))
    return mapped.id ? mapped : null
  }

  function pill(
    target?: SupplierSurface | null | undefined,
    userOverride?: UserLike | null
  ): SupplierPill | null {
    return buildInterface(target, userOverride)
  }

  function cell(
    target?: SupplierSurface | null | undefined,
    userOverride?: UserLike | null
  ): SupplierCell | null {
    return buildInterface(target, userOverride)
  }

  function preview(
    target?: SupplierSurface | null | undefined,
    userOverride?: UserLike | null
  ): SupplierPreview | null {
    return buildInterface(target, userOverride)
  }

  function profile(
    target?: SupplierSurface | null | undefined,
    userOverride?: UserLike | null
  ): SupplierProfile | null {
    return buildInterface(target, userOverride)
  }

  return {
    pill,
    cell,
    preview,
    profile,
  }
}
