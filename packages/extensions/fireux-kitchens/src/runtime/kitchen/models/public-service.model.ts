import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'

/** Guest-facing schedule only; never operational settings or notification recipients. */
export type KitchenPublicService = {
  id: string
  name: string
  hours?: WeekdayTimeWindowsConfig
  paused: boolean
}
