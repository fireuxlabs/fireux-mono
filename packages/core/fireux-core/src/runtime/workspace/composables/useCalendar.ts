import { ref } from 'vue'

/** Shared calendar selection. Domain adapters own event sources and policy. */
export function useCalendar() {
  const today = new Date()
  const selectedDate = ref([
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-'))

  return { selectedDate }
}
