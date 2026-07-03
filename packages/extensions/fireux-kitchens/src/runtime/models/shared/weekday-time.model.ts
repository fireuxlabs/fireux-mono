export type WeekdayTimeDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type WeekdayTimeWindow = {
  days: WeekdayTimeDay[]
  open: string
  close: string
}

export type WeekdayTimeWindowsConfig = {
  timezone: string
  windows: WeekdayTimeWindow[]
}
