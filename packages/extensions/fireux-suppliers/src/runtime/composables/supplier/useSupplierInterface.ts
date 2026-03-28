import {
  csv,
  firstNonEmptyString,
  locationLabel,
  resolveProfileBadges,
  resolveProfileImage,
  resolveProfileSummary,
  safeString,
  safeStringArray,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { CoreUser } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import type { SupplierCore } from '../../models/supplier/Supplier.model'
import { SUPPLIER_COLLECTION } from './constants'
import type { SupplierRefs } from './useSupplierRecord'

type UserLike = Pick<CoreUser, 'avatar'>
type SupplierTarget = SupplierSurface & { user?: UserLike | null }

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string
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
    tagline?: string
    categoriesCsv?: string
    specialtiesCsv?: string
  }
}

export type SupplierSurface = Partial<SupplierCore> & {
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
  userRef?: Ref<CoreUser | null | undefined>
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
    const source = target as SupplierCore
    const id = firstNonEmptyString([target.supplier_id, target.source_supplier_id, target.id])
    const organizationName = firstNonEmptyString([
      target.supplier_organization_name,
      target.organization_name,
      target.name,
      target.short_name,
      target.title,
      id,
    ])
    const badges = resolveProfileBadges([
      target.supplier_product_categories,
      target.categories,
      target.tags,
    ])
    const specialties = safeStringArray(source.specialties)
    const deliveryAreas = safeStringArray(target.supplier_delivery_areas)
    const tagline = firstNonEmptyString([
      target.supplier_headline,
      target.tagline,
      target.title,
    ])
    const summary = resolveProfileSummary([
      target.summary,
      source.supplier_bio,
      source.bio_long,
    ])
    const primaryAvatar = resolveProfileImage([
      target.image,
      source.supplier_image,
      target.image_url,
      target.logo_url,
      target.avatar_url,
      user?.avatar,
    ])
    const specialtiesCsv = csv(specialties.length ? specialties : badges)
    const categoriesCsv = csv(badges)
    const locationsLabel = deliveryAreas.length
      ? deliveryAreas.join(', ')
      : locationLabel(source.locations)
    const categoryLabel = firstNonEmptyString([
      target.category,
      target.business_type,
      firstArrayValue(target.supplier_product_categories),
      firstArrayValue(target.categories),
      firstArrayValue(target.tags),
    ])
    const title = firstNonEmptyString([organizationName, target.title, target.name, target.short_name, id])
    const subtitle = firstNonEmptyString([tagline, locationsLabel, categoryLabel])

    return {
      id,
      to: id ? `/${SUPPLIER_COLLECTION}/${encodeURIComponent(id)}` : '',
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
      tagline: tagline || undefined,
      categoriesCsv: categoriesCsv || undefined,
      specialtiesCsv: specialtiesCsv || undefined,
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

  function searchText(target: SupplierSurface): string {
    const mapped = map(target, resolveUser(target as SupplierTarget))

    return [
      mapped.id,
      mapped.title,
      mapped.subtitle,
      mapped.summary,
      mapped.organizationName,
      mapped.locationsLabel,
      mapped.specialtiesCsv ?? '',
      mapped.categoriesCsv ?? '',
      mapped.tagline ?? '',
      safeString(target.short_name),
      safeString(target.supplier_headline),
      safeString(target.supplier_organization_name),
      safeStringArray(target.supplier_product_categories).join(' '),
      safeStringArray(target.categories).join(' '),
      safeStringArray(target.tags).join(' '),
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { interface: buildInterface, pill, cell, preview, profile, searchText }
}
