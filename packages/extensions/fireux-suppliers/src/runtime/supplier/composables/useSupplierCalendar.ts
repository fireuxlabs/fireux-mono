import { useCalendar } from 'fireux-core/runtime/workspace/composables/useCalendar'

export function useSupplierCalendar() {
  return { ...useCalendar(), connected: false }
}
