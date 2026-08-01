import { weekdayTimeCore } from './weekday-time-core'
import { weekdayTimeConfig } from './weekday-time-config'
import { weekdayTimeFormat } from './weekday-time-format'
import { weekdayTimeState } from './weekday-time-state'

export const weekdayTimeDayOptions = weekdayTimeCore.dayOptions
export const weekdayTimeDays = weekdayTimeCore.days

export const parseWeekdayTimeText = weekdayTimeConfig.parseText
export const readWeekdayTimeWindowsConfig = weekdayTimeConfig.readWindowsConfig
export const weekdayTimeWindowFromRange = weekdayTimeConfig.windowFromRange

export const formatWeekdayTimeText = weekdayTimeFormat.formatText
export const formatWeekdayTimeWindow = weekdayTimeFormat.formatWindow
export const weekdayTimeLines = weekdayTimeFormat.lines

export const readWeekdayTimeNoticeState = weekdayTimeState.notice
export const readWeekdayTimeOpenState = weekdayTimeState.open
export const readWeekdayTimeSelectionState = weekdayTimeState.selection
