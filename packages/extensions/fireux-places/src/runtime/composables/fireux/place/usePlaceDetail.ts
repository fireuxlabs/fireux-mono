import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import { computed, resolveComponent } from 'vue'
import { usePlaceFetch, usePlaceSeo } from '../firestore/place/usePlace'
import type {
  PlaceBusinessHoursDay,
  PlaceBusinessHoursWindow,
} from '../../../models/place.model'

export function usePlaceDetail(props: { locator: string }) {
  const locator = computed(() => String(props.locator || '').trim())
  const { place, outcome, statusCode, missing, failed, refresh, ready } =
    usePlaceFetch(locator)

  const { isAdmin } = useUser()
  const showDebug = import.meta.dev
  const resolvedRelatedOperations = resolveComponent(
    'KitchenPlacePublicOperations',
    false
  )
  const relatedOperationsComponent =
    typeof resolvedRelatedOperations === 'string'
      ? null
      : resolvedRelatedOperations
  const initials = computed(() =>
    String(place.value?.name || 'P')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  )
  const detailStyle = computed(() => {
    const palette = place.value?.brand_palette
    return {
      '--fx-public-entity-accent':
        palette?.primary_color || 'var(--ui-primary)',
      '--fx-place-identity-backdrop':
        place.value?.assets.backdrop_color ||
        palette?.secondary_color ||
        palette?.primary_color ||
        'transparent',
    }
  })
  const placeTypeLabel = computed(() =>
    place.value?.place_type === 'non_physical'
      ? 'Non-physical place'
      : 'Physical place'
  )
  const mapUrl = computed(() => {
    if (place.value?.google_maps_url) return place.value.google_maps_url
    const address = String(place.value?.short_address || '').trim()
    if (!address || !place.value?.name) return ''
    const query = encodeURIComponent(`${place.value.name}, ${address}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  })
  const primaryActions = computed(
    () =>
      [
        mapUrl.value
          ? {
              key: 'directions',
              label: 'Directions',
              ariaLabel: `Get directions to ${place.value?.name || 'this place'}`,
              icon: 'i-lucide-navigation',
              to: mapUrl.value,
              target: '_blank' as const,
              rel: 'noopener noreferrer',
            }
          : null,
        place.value?.website
          ? {
              key: 'website',
              label: 'Website',
              ariaLabel: `Visit the ${place.value.name} website`,
              icon: 'i-lucide-external-link',
              to: place.value.website,
              target: '_blank' as const,
              rel: 'noopener noreferrer',
            }
          : null,
      ].filter(Boolean) as Array<{
        key: 'directions' | 'website'
        label: string
        ariaLabel: string
        icon: string
        to: string
        target: '_blank'
        rel: string
      }>
  )
  const websiteLabel = computed(() => {
    const value = String(place.value?.website || '').trim()
    if (!value) return ''
    try {
      return new URL(value).hostname.replace(/^www\./, '')
    } catch {
      return value
    }
  })
  const hasVisitDetails = computed(() =>
    Boolean(
      place.value?.short_address ||
        place.value?.website ||
        (!place.value?.business_hours?.windows?.length &&
          place.value?.place_type === 'physical')
    )
  )
  const facts = computed(
    () =>
      [
        place.value?.short_name &&
        place.value.short_name.localeCompare(place.value.name, undefined, {
          sensitivity: 'base',
        }) !== 0
          ? { label: 'Also known as', value: place.value.short_name }
          : null,
        place.value?.default_currency_code
          ? { label: 'Currency', value: place.value.default_currency_code }
          : null,
        place.value?.timezone
          ? { label: 'Time zone', value: place.value.timezone }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>
  )
  const socialActions = computed(() => {
    const labels = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
    } as const
    return Object.entries(place.value?.social_links || {})
      .filter(([key, value]) => key in labels && Boolean(value))
      .map(([key, value]) => ({
        key,
        label: labels[key as keyof typeof labels],
        to: String(value),
      }))
  })

  const orderedDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const satisfies readonly PlaceBusinessHoursDay[]
  const dayLabels: Record<PlaceBusinessHoursDay, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }

  function formatDays(value: PlaceBusinessHoursDay[]) {
    const days = orderedDays.filter((day) => value.includes(day))
    if (days.length === orderedDays.length) return 'Every day'
    if (!days.length) return ''
    const indexes = days.map((day) => orderedDays.indexOf(day))
    const contiguous = indexes.every(
      (index, position) => position === 0 || index === indexes[position - 1] + 1
    )
    if (contiguous && days.length > 2) {
      return `${dayLabels[days[0]]}–${dayLabels[days[days.length - 1]]}`
    }
    return days.map((day) => dayLabels[day]).join(', ')
  }

  function formatWindow(window: PlaceBusinessHoursWindow) {
    return window.open === '00:00' && window.close === '00:00'
      ? 'Open 24 hours'
      : `${window.open}–${window.close}`
  }

  const hoursRows = computed(() =>
    (place.value?.business_hours?.windows || [])
      .map((window) => ({
        days: formatDays(window.days),
        time: formatWindow(window),
      }))
      .filter((row) => row.days)
  )
  const hasEditorialContent = computed(() =>
    Boolean(place.value?.about || place.value?.assets.gallery.length)
  )
  const editTo = computed(() =>
    locator.value
      ? `/places/${encodeURIComponent(locator.value)}/edit`
      : '/places'
  )

  function hideFailedImage(event: Event) {
    const image = event.currentTarget as HTMLImageElement | null
    if (image) image.hidden = true
  }

  usePlaceSeo(place)

  return {
    locator,
    place,
    outcome,
    statusCode,
    missing,
    failed,
    refresh,
    ready,
    isAdmin,
    showDebug,
    relatedOperationsComponent,
    initials,
    detailStyle,
    placeTypeLabel,
    mapUrl,
    primaryActions,
    websiteLabel,
    hasVisitDetails,
    facts,
    socialActions,
    hoursRows,
    hasEditorialContent,
    editTo,
    hideFailedImage,
  }
}
