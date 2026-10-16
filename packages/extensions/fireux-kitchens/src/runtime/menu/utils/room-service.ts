/** Room context comes from the dedicated entrance, never a customer room picker. */
export function roomServiceRoomNumber(value: unknown): string {
  if (typeof value !== 'string') return ''
  const room = value.trim()
  return /[\p{L}\p{N}]/u.test(room) &&
    room.length <= 40 &&
    /^[\p{L}\p{N} ._-]+$/u.test(room)
    ? room
    : ''
}

export function roomServiceEntrancePath(
  kitchenSlug: string,
  roomNumber: unknown
): string {
  const room = roomServiceRoomNumber(roomNumber)
  return kitchenSlug.trim() && room
    ? `/kitchens/${encodeURIComponent(kitchenSlug.trim())}/room-service/${encodeURIComponent(room)}`
    : ''
}
