import { useCalendar } from 'fireux-core/runtime/composables/fireux/workspace/useCalendar'

export function useSupplierCalendar() {
  return { ...useCalendar(), connected: false }
}
