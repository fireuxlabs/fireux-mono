import { useCalendar } from 'fireux-core/runtime/workspace/composables/useCalendar'

export function useBlankCalendar() {
  return { ...useCalendar(), connected: false }
}
