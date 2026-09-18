// Explicit, bounded projections for shareable Identity diagnostics. Never pass
// whole operational records, media URLs, auth state or raw errors to the panel.
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) =>
  typeof value === 'string' ? value.slice(0, 500) : null
const flag = (value: unknown) => (typeof value === 'boolean' ? value : null)
const list = (value: unknown) => (Array.isArray(value) ? value : [])

export function identityHoursDebug(value: unknown) {
  if (value == null) return null
  const hours = record(value)
  const windows = list(hours.windows)
  return {
    source: text(hours.source),
    timezone: text(hours.timezone),
    windows: windows.slice(0, 100).map((value) => {
      const window = record(value)
      return {
        days: list(window.days).slice(0, 7).map(text),
        open: text(window.open),
        close: text(window.close),
      }
    }),
    omittedWindows: Math.max(0, windows.length - 100),
  }
}

export function identityKitchenDebug(value: unknown) {
  if (!value) return null
  const kitchen = record(value)
  return {
    id: text(kitchen.id),
    slug: text(kitchen.slug),
    status: text(kitchen.status),
    visibility: flag(kitchen.visibility),
    currency: text(kitchen.currency),
    identity_source: text(kitchen.identity_source),
  }
}

export function identityPlaceDebug(value: unknown) {
  if (!value) return null
  const place = record(value)
  return {
    id: text(place.id),
    slug: text(place.slug),
    name: text(place.name),
    short_name: text(place.short_name),
    tagline: text(place.tagline),
    place_type: text(place.place_type),
    timezone: text(place.timezone),
    business_hours: identityHoursDebug(place.business_hours),
  }
}

export function identityPresenceDebug(value: unknown) {
  const place = record(value)
  return {
    about: Boolean(place.about),
    address: Boolean(place.formatted_address),
    phone: Boolean(place.phone),
    email: Boolean(place.email),
    website: Boolean(place.website),
    profileImage: Boolean(place.image_url),
    logo: Boolean(place.logo_image),
    wordmark: Boolean(place.wordmark_image),
    cover: Boolean(place.cover_image),
    galleryCount: list(place.gallery_images).length,
  }
}

export function identityOperatingSourcesDebug(
  value: unknown,
  menus: unknown[]
) {
  const kitchen = record(value)
  const services = list(kitchen.services)
  return {
    kitchenOperationHours: identityHoursDebug(
      record(kitchen.orders).operation_hours
    ),
    menus: menus.slice(0, 100).map((value) => {
      const menu = record(value)
      return {
        id: text(menu.id),
        slug: text(menu.slug),
        name: text(menu.name),
        status: text(menu.status),
      }
    }),
    services: services.slice(0, 20).map((value) => {
      const service = record(value)
      return {
        id: text(service.id),
        name: text(service.name),
        enabled: flag(service.enabled),
        menu_ids: list(service.menu_ids).slice(0, 100).map(text),
        omittedMenuIds: Math.max(0, list(service.menu_ids).length - 100),
        hours: identityHoursDebug(service.hours),
        interactions: list(service.interactions)
          .slice(0, 10)
          .map((value) => {
            const interaction = record(value)
            return {
              type: text(interaction.type),
              enabled: flag(interaction.enabled),
              paused: flag(record(interaction.availability).paused),
            }
          }),
        omittedInteractions: Math.max(
          0,
          list(service.interactions).length - 10
        ),
      }
    }),
    omittedMenus: Math.max(0, menus.length - 100),
    omittedServices: Math.max(0, services.length - 20),
  }
}
