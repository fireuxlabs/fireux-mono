type FirestoreTimestampLike = {
  seconds?: number
  _seconds?: number
  toMillis?: () => number
}

export function kitchenOrderTimestampMs(value: unknown) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') {
    return value > 1_000_000_000_000 ? value : value * 1000
  }

  const timestamp = value as FirestoreTimestampLike | null
  if (typeof timestamp?.toMillis === 'function') return timestamp.toMillis()

  const seconds = Number(timestamp?.seconds ?? timestamp?._seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const parsed = Date.parse(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatKitchenOrderRequestedTime(
  value: unknown,
  nowMs = Date.now()
) {
  const requestedMs = kitchenOrderTimestampMs(value)
  if (!requestedMs) return { dateTime: 'Time needed', distance: '' }

  const requested = new Date(requestedMs)
  const dayDifference = Math.round(
    (startOfDay(requested).getTime() - startOfDay(new Date(nowMs)).getTime()) /
      86_400_000
  )
  const day =
    dayDifference === 0
      ? 'Today'
      : dayDifference === 1
        ? 'Tomorrow'
        : new Intl.DateTimeFormat('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          }).format(requested)
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(requested)
  const minutes = Math.round((requestedMs - nowMs) / 60_000)
  const distance =
    minutes < 0
      ? `${Math.abs(minutes)} min late`
      : minutes === 0
        ? 'Now'
        : `In ${minutes} min`

  return {
    dateTime: `${day}, ${time}`,
    distance,
  }
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}
