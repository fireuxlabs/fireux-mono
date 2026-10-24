import { ref } from 'vue'

/** Shared calendar selection. Domain adapters own event sources and policy. */
export function useCalendar() {
  const dateKey = () => {
    const today = new Date()
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-')
  }
  const selectedDate = ref(dateKey())
  const resetDate = () => {
    selectedDate.value = dateKey()
  }

  return { selectedDate, resetDate }
}
