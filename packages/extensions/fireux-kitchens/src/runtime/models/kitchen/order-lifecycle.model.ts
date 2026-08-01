export const KitchenOrderTypes = [
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
] as const

export type KitchenOrderType = (typeof KitchenOrderTypes)[number]

export const KitchenOrderChannels = [
  'menu',
  'table_qr',
  'kiosk',
  'room_service',
  'staff_pos',
] as const

export type KitchenOrderChannel = (typeof KitchenOrderChannels)[number]

export type KitchenOrderAcceptancePolicy = 'automatic' | 'operator'

export type KitchenOrderIntakePolicy = {
  acceptance: KitchenOrderAcceptancePolicy
  channels: readonly KitchenOrderChannel[]
  default_channel: KitchenOrderChannel
}

export const KitchenOrderIntakePolicies = {
  dine_in: {
    acceptance: 'automatic',
    channels: ['table_qr', 'staff_pos'],
    default_channel: 'table_qr',
  },
  eat_in: {
    acceptance: 'automatic',
    channels: ['kiosk', 'staff_pos'],
    default_channel: 'kiosk',
  },
  takeaway: {
    acceptance: 'automatic',
    channels: ['kiosk', 'staff_pos'],
    default_channel: 'kiosk',
  },
  collection: {
    acceptance: 'operator',
    channels: ['menu'],
    default_channel: 'menu',
  },
  delivery: {
    acceptance: 'operator',
    channels: ['menu'],
    default_channel: 'menu',
  },
  pre_order: {
    acceptance: 'operator',
    channels: ['menu'],
    default_channel: 'menu',
  },
  room_service: {
    acceptance: 'automatic',
    channels: ['room_service'],
    default_channel: 'room_service',
  },
} as const satisfies Record<KitchenOrderType, KitchenOrderIntakePolicy>

export const KitchenOrderStatuses = [
  'pending_payment',
  'pending_acceptance',
  'changes_requested',
  'accepted',
  'ready',
  'completed',
  'cancelled',
  'trashed',
] as const

export type KitchenOrderStatus = (typeof KitchenOrderStatuses)[number]

export type KitchenOrderInitialStatus = Extract<
  KitchenOrderStatus,
  'pending_payment' | 'pending_acceptance' | 'accepted'
>

export type KitchenOrderPostPaymentStatus = Extract<
  KitchenOrderStatus,
  'pending_acceptance' | 'accepted'
>

export const KitchenOrderTransitions = [
  'accept',
  'reject',
  'mark_ready',
  'return_to_queue',
  'complete',
  'trash',
] as const

export type KitchenOrderTransition = (typeof KitchenOrderTransitions)[number]

export type KitchenOrderStateTransition = Exclude<
  KitchenOrderTransition,
  'trash'
>

export type KitchenOrderTransitionRule = {
  from: KitchenOrderStatus
  to: KitchenOrderStatus
}

export const KitchenOrderTransitionRules = {
  accept: {
    from: 'pending_acceptance',
    to: 'accepted',
  },
  reject: {
    from: 'pending_acceptance',
    to: 'changes_requested',
  },
  mark_ready: {
    from: 'accepted',
    to: 'ready',
  },
  return_to_queue: {
    from: 'ready',
    to: 'accepted',
  },
  complete: {
    from: 'ready',
    to: 'completed',
  },
} as const satisfies Record<
  KitchenOrderStateTransition,
  KitchenOrderTransitionRule
>

export type KitchenOrderBoardStage =
  | 'payment'
  | 'incoming'
  | 'queue'
  | 'pass'
  | 'recent'
  | 'trash'
  | 'unmapped'

export function deriveKitchenOrderBoardStage(order: {
  status?: unknown
}): KitchenOrderBoardStage {
  const status = String(order.status ?? '').trim()

  if (status === 'trashed') return 'trash'
  if (
    status === 'completed' ||
    status === 'cancelled' ||
    status === 'changes_requested'
  ) return 'recent'
  if (status === 'pending_payment') return 'payment'
  if (status === 'pending_acceptance') return 'incoming'
  if (status === 'ready') return 'pass'
  if (status === 'accepted') return 'queue'
  return 'unmapped'
}

export function isKitchenOrderStatus(value: unknown): value is KitchenOrderStatus {
  return KitchenOrderStatuses.includes(value as KitchenOrderStatus)
}

export function kitchenOrderIntakePolicy(
  orderType: KitchenOrderType
): KitchenOrderIntakePolicy {
  return KitchenOrderIntakePolicies[orderType]
}

export function resolveKitchenOrderIntakeStatus(input: {
  orderType: KitchenOrderType
  paymentPending: boolean
}): KitchenOrderInitialStatus {
  if (input.paymentPending) return 'pending_payment'

  return resolveKitchenOrderPostPaymentStatus(input.orderType)
}

export function resolveKitchenOrderPostPaymentStatus(
  orderType: KitchenOrderType
): KitchenOrderPostPaymentStatus {
  return kitchenOrderIntakePolicy(orderType).acceptance === 'operator'
    ? 'pending_acceptance'
    : 'accepted'
}

export function isKitchenOrderPostPaymentStatus(
  value: unknown
): value is KitchenOrderPostPaymentStatus {
  return value === 'pending_acceptance' || value === 'accepted'
}

export function isKitchenOrderType(value: unknown): value is KitchenOrderType {
  return KitchenOrderTypes.includes(value as KitchenOrderType)
}

export function isKitchenOrderChannel(
  value: unknown
): value is KitchenOrderChannel {
  return KitchenOrderChannels.includes(value as KitchenOrderChannel)
}

export function isKitchenOrderTransition(
  value: unknown
): value is KitchenOrderTransition {
  return KitchenOrderTransitions.includes(value as KitchenOrderTransition)
}

export function kitchenOrderTransitionRule(
  transition: KitchenOrderStateTransition
): KitchenOrderTransitionRule {
  return KitchenOrderTransitionRules[transition]
}

