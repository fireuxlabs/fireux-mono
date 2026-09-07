import { useCalendar } from 'fireux-core/runtime/composables/fireux/workspace/useCalendar'

export function useBlankCalendar() {
  return { ...useCalendar(), connected: false }
}
