import { createError } from 'h3'
import type { KitchenOrderType } from '../../../models/kitchen/order.model.ts'
import type { MenuOrderingCollectionState } from '../../../models/kitchen/menu/menu-ordering.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import {
  readWeekdayTimeNoticeState,
  readWeekdayTimeOpenState,
  readWeekdayTimeSelectionState,
} from '../../../utils/weekday-time.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'

const text = (value: unknown) => String(value ?? '').trim()
const requestedForParts = (value: unknown) => {
  const [date = '', time = ''] = text(value).split('T')

  return { date, time: time.slice(0, 5) }
}

export function validateMenuOrderSchedule(input: {
  collection: MenuOrderingCollectionState | null
  hours?: WeekdayTimeWindowsConfig
  noticeHours?: number
  orderType: KitchenOrderType
  requestedFor: string
}) {
  const strategy = menuOrderTypeStrategy(input.orderType)
  const scheduledFor = strategy.schedule === 'requested_for'
    ? input.requestedFor
    : strategy.schedule === 'collection' &&
        input.collection?.mode === 'scheduled'
      ? input.collection.requested_for || ''
      : ''
  if (strategy.schedule === 'requested_for' && !scheduledFor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose when you would like to eat.',
    })
  }

  if (scheduledFor && input.hours?.windows.length) {
    const selected = requestedForParts(scheduledFor)
    const selection = readWeekdayTimeSelectionState(
      input.hours,
      selected.date,
      selected.time
    )
    if (!selection.available) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Choose a time during serving hours.',
      })
    }
  } else if (!scheduledFor && input.hours?.windows.length) {
    const openState = readWeekdayTimeOpenState(input.hours)
    if (openState.known && !openState.open) {
      throw createError({
        statusCode: 400,
        statusMessage: 'This menu is not accepting orders outside serving hours.',
      })
    }
  }

  if (!scheduledFor) return

  const noticeHours = Math.max(0, Number(input.noticeHours) || 0)
  const notice = readWeekdayTimeNoticeState(
    input.hours,
    scheduledFor,
    noticeHours
  )
  if (!notice.complete) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a valid future date and time.',
    })
  }
  if (!notice.available) {
    throw createError({
      statusCode: 400,
      statusMessage: noticeHours > 0
        ? `Choose a time at least ${noticeHours} hours from now.`
        : 'Choose a future date and time.',
    })
  }
}
