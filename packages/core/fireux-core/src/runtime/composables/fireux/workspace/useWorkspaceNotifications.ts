// Concurrent edit — 2026-07-20 15:26 CEST — Customer order notification pass: share live unread state with the notification trigger.
import { useState } from '#imports'

export const useWorkspaceNotifications = () => {
  const isOpen = useState<boolean>('fireux-core:workspace:notifs-open', () => false)
  const unreadCount = useState<number>(
    'fireux-core:workspace:notifs-unread-count',
    () => 0
  )

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const setUnreadCount = (value: number) => {
    const count = Number(value)
    unreadCount.value = Number.isSafeInteger(count) && count > 0 ? count : 0
  }

  return {
    isOpen,
    unreadCount,
    open,
    close,
    setUnreadCount,
  }
}
