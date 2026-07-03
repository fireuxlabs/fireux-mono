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

export type WeekdayTimeWindowsSource = 'place' | 'custom'

export type WeekdayTimeWindowsConfig = {
  source: WeekdayTimeWindowsSource
  timezone: string
  windows: WeekdayTimeWindow[]
}
