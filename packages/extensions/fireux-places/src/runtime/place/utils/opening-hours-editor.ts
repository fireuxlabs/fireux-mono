import type {
  PlaceBusinessHours,
  PlaceBusinessHoursDay,
  PlaceBusinessHoursWindow,
} from '../models/place.model'

export const openingDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const
export type OpeningRange = Pick<PlaceBusinessHoursWindow, 'open' | 'close'>

export function replaceOpeningDays(
  current: PlaceBusinessHours,
  selected: PlaceBusinessHoursDay[],
  ranges: OpeningRange[]
): PlaceBusinessHours {
  const days = [...new Set(selected)]
  if (!days.length || days.some((day) => !openingDays.includes(day)))
    throw new Error('Choose at least one day.')
  for (const range of ranges) {
    if (
      ![range.open, range.close].every((value) =>
        /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
      )
    )
      throw new Error('Enter valid opening and closing times.')
    if (range.open === range.close && range.open !== '00:00')
      throw new Error(
        'Opening and closing times must differ. Use Open 24 hours for a full day.'
      )
  }
  return {
    windows: [
      ...current.windows
        .map((window) => ({
          ...window,
          days: window.days.filter((day) => !days.includes(day)),
        }))
        .filter((window) => window.days.length),
      ...ranges.map((range) => ({
        days: [...days],
        open: range.open,
        close: range.close,
      })),
    ],
  }
}
