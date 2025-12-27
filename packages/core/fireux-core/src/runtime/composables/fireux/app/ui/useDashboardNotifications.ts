import { useState } from '#imports'

export const useDashboardNotifications = () => {
  const isOpen = useState<boolean>('fireux-core:dashboard:notifs-open', () => false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    open,
    close,
  }
}
