export type KitchenOrderIntake = {
  pause: 'open' | 'off_site' | 'all'
  off_site_acceptance: 'manual' | 'automatic'
  preparation_minutes: number
}
