import { useCalendar } from 'fireux-core/runtime/workspace/composables/useCalendar'

export function usePortfolioCalendar() {
  return { ...useCalendar(), connected: false }
}
