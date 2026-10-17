import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'

/** Guest-facing schedule only; never operational settings or notification recipients. */
export type KitchenPublicOffering = {
  id: string
  name: string
  /** Named entrance, independent of collection timing. */
  separate?: boolean
  collection_timing?: 'same_day' | 'next_day'
  hours?: WeekdayTimeWindowsConfig
  paused: boolean
}
