import { useCalendar } from 'fireux-core/runtime/composables/fireux/workspace/useCalendar'

export function usePortfolioCalendar() {
  return { ...useCalendar(), connected: false }
}
