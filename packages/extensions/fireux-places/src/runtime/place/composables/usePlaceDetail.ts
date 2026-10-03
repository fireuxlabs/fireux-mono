import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { usePlaceFetch } from './firestore/fetch/usePlaceFetch'
import { usePlaceSeo } from './usePlaceSeo'
import type {
  PlaceBusinessHoursDay,
  PlaceBusinessHoursWindow,
} from '../models/place.model.ts'

export function usePlaceDetail(routeLocator: MaybeRefOrGetter<string>) {
  const locator = computed(() => String(toValue(routeLocator) || '').trim())
  const {
    place: loadedPlace,
    outcome,
    statusCode,
    missing,
    failed,
    refresh,
    ready,
  } = usePlaceFetch(locator)

  const { isAdmin } = useUserSession()
  // usePlaceFetch already follows the authorized live server projection.
  // A second raw document listener bypasses that projection under open Rules
  // and fails under production Rules; retaining its last value also hides revocation.
  const place = loadedPlace
  const showDebug = import.meta.dev
  const detailStyle = computed(() => {
    const color = place.value?.media_backdrop_color
    return color ? { '--fx-entity-media-bg': color } : undefined
  })
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
        (!place.value?.business_hours.windows.length &&
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
    (place.value?.business_hours.windows || [])
      .map((window) => ({
        days: formatDays(window.days),
        time: formatWindow(window),
      }))
      .filter((row) => row.days)
  )
  const hasEditorialContent = computed(() =>
    Boolean(place.value?.about || place.value?.gallery_images?.length)
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
    detailStyle,
    websiteLabel,
    hasVisitDetails,
    facts,
    hoursRows,
    hasEditorialContent,
    editTo,
    hideFailedImage,
  }
}
