import { createError } from 'h3'
import type {
  MenuOrderingCollectionState,
  MenuOrderingRoomServiceState,
  MenuOrderingTableState,
} from '../../models/menu-order-draft.model.ts'
import type { CreateMenuOrderBody } from './lines.ts'
import type { MenuOrderTypeStrategy } from './order-type.ts'
import { text } from './order-request.ts'

export type MenuOrderDestination = {
  collection: MenuOrderingCollectionState | null
  roomService?: MenuOrderingRoomServiceState
  table?: MenuOrderingTableState
}

const requiredLocationLabel = (value: unknown, label: string) => {
  const result = text(value)
  if (!result) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is required.`,
    })
  }
  if (result.length > 64 || /[\u0000-\u001f\u007f]/.test(result)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is not valid.`,
    })
  }

  return result
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const readCollection = (value: unknown): MenuOrderingCollectionState => {
  const source = record(value)
  const mode = text(source.mode)
  const requestedFor = text(source.requested_for)

  if (mode === 'scheduled' && !requestedFor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a collection time.',
    })
  }
  if (mode === 'scheduled' || requestedFor) {
    return {
      mode: 'scheduled',
      requested_for: requestedFor,
    }
  }

  return { mode: 'queue' }
}

export function readMenuOrderDestination(
  body: CreateMenuOrderBody | null,
  strategy: MenuOrderTypeStrategy
): MenuOrderDestination {
  if (
    strategy.destination !== 'table' &&
    body?.table !== undefined &&
    body.table !== null
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Table destination does not match this order type.',
    })
  }
  if (
    strategy.destination !== 'room_service' &&
    body?.room_service !== undefined &&
    body.room_service !== null
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room destination does not match this order type.',
    })
  }

  const source =
    strategy.destination === 'table'
      ? record(body?.table)
      : strategy.destination === 'room_service'
        ? record(body?.room_service)
        : {}

  return {
    collection:
      strategy.destination === 'collection'
        ? readCollection(body?.collection)
        : null,
    ...(strategy.destination === 'table'
      ? { table: { number: requiredLocationLabel(source.number, 'Table') } }
      : {}),
    ...(strategy.destination === 'room_service'
      ? {
          roomService: {
            room: requiredLocationLabel(source.room, 'Room'),
          },
        }
      : {}),
  }
}
