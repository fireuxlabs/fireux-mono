<template>
  <section class="customer-orders" aria-labelledby="customer-orders-title">
    <header class="customer-orders__header">
      <div>
        <h1 id="customer-orders-title">My orders</h1>
        <p>Current and previous kitchen orders.</p>
      </div>
    </header>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Orders could not be loaded"
      :description="error"
    />

    <div v-else-if="pending" class="customer-orders__loading">
      <USkeleton
        v-for="index in 3"
        :key="index"
        class="customer-orders__skeleton"
      />
    </div>

    <MoleculesStateCard
      v-else-if="!orders.length"
      entity="orders"
      state="empty"
      icon="i-lucide-receipt-text"
      title="No orders yet"
      description="Orders placed while you are signed in will appear here."
    >
      <UButton to="/menus" label="Browse menus" />
    </MoleculesStateCard>

    <div v-else class="customer-orders__list">
      <UCard
        v-for="order in orders"
        :key="order.id"
        class="customer-orders__card"
      >
        <div class="customer-orders__card-heading">
          <div class="customer-orders__identity">
            <UAvatar
              :src="kitchenImage(order) || undefined"
              :alt="order.kitchen.name"
              size="lg"
              icon="i-lucide-chef-hat"
              :class="kitchenAvatarClass(order)"
            />

            <div>
              <UButton
                v-if="order.kitchen.path"
                :to="order.kitchen.path"
                :label="order.kitchen.name"
                color="neutral"
                variant="link"
                class="customer-orders__kitchen-link"
              />
              <p v-else class="customer-orders__kitchen">
                {{ order.kitchen.name }}
              </p>
              <h2>
                {{
                  order.order_number ? `Order ${order.order_number}` : 'Order'
                }}
              </h2>
            </div>
          </div>

          <UBadge :color="statusColor(order.status)" variant="soft">
            {{ statusLabel(order.status, order.order_type) }}
          </UBadge>
        </div>

        <dl class="customer-orders__facts">
          <div>
            <dt>Order</dt>
            <dd>{{ orderTypeLabel(order.order_type) }}</dd>
          </div>
          <div>
            <dt>Items</dt>
            <dd>{{ order.item_count }}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>{{ orderTimeLabel(order) }}</dd>
          </div>
          <div v-if="order.delivery?.address">
            <dt>Delivery</dt>
            <dd>{{ order.delivery.address }}</dd>
          </div>
          <div v-if="order.payment?.method">
            <dt>Payment</dt>
            <dd>{{ paymentLabel(order) }}</dd>
          </div>
        </dl>

        <p v-if="order.kitchen_note" class="customer-orders__kitchen-note">
          <UIcon name="i-lucide-message-square-warning" aria-hidden="true" />
          <span>{{ order.kitchen_note }}</span>
        </p>

        <template #footer>
          <UButton
            :to="order.menu.path"
            :label="order.menu.name"
            icon="i-lucide-utensils"
            color="neutral"
            variant="ghost"
          />
        </template>
      </UCard>

      <UButton
        v-if="hasMore"
        label="Load more"
        color="neutral"
        variant="outline"
        :loading="loadingMore"
        @click="loadMore"
      />
    </div>

    <!-- 2026-07-19 14:57 CEST: Keep this dev projection while concurrent Order-stack work audits missing customer links and rejected-order history. -->
<DevDebugPanel
  object-origin="fetched"      launcher
      include-route
      title="Customer orders (JSON)"
      context="customer dashboard · customer order projection"
      :objects="{ orders }"
      :derived="debug"
      :hide-when-empty="false"
    />
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: project requested timing and readiness through My orders.
// Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: present asynchronous Kitchen confirmation in My orders.
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: present sparse customer Order identifiers without blank copy.
import { useCustomerOrders } from '../../../composables/customer/useCustomerOrders'
import type { CustomerOrderSummary } from '../../../models/customer/order.model.ts'
import type {
  KitchenOrderStatus,
  KitchenOrderType,
} from '../../../../kitchen/models/order.model.ts'
import { kitchenOrderPaymentMethodLabel } from '../../../../menu/utils/menu-order-payment'

const { debug, error, hasMore, loadMore, loadingMore, orders, pending } =
  useCustomerOrders()

const statusLabels: Record<KitchenOrderStatus, string> = {
  pending_payment: 'Payment needed',
  pending_acceptance: 'Waiting for kitchen',
  changes_requested: 'Kitchen requested a change',
  accepted: 'Kitchen accepted',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  trashed: 'Removed',
}

function statusLabel(status: KitchenOrderStatus, type: KitchenOrderType) {
  if (status === 'pending_acceptance' && type === 'pre_order') {
    return 'Waiting for confirmation'
  }
  if (status === 'ready' && type === 'collection') return 'Ready to collect'
  if (status === 'ready' && type === 'delivery') return 'Ready for delivery'
  if (status === 'ready' && type === 'pre_order') return 'Pre-order ready'
  return statusLabels[status]
}

function statusColor(status: KitchenOrderStatus) {
  if (status === 'ready' || status === 'completed') return 'success' as const
  if (status === 'cancelled' || status === 'trashed') return 'error' as const
  if (status === 'changes_requested') return 'warning' as const
  if (status === 'pending_payment') return 'warning' as const
  return 'primary' as const
}

function kitchenImage(order: CustomerOrderSummary) {
  return order.kitchen.logo_image_url || ''
}

function kitchenAvatarClass(order: CustomerOrderSummary) {
  if (order.kitchen.image_shade === 'light') return 'fx-avatar-shade--light'
  if (order.kitchen.image_shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
}

function orderTypeLabel(type: KitchenOrderType) {
  return type
    .split('_')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function orderTimeLabel(order: CustomerOrderSummary) {
  if (order.collection?.mode === 'queue') return 'As soon as possible'
  const requested = formatDate(
    order.collection?.requested_for || order.requested_for
  )
  if (order.order_type === 'delivery' && !requested)
    return 'As soon as possible'
  return requested || formatDate(order.created_at) || 'Time unavailable'
}

function paymentLabel(order: CustomerOrderSummary) {
  if (!order.payment?.method) return ''
  return kitchenOrderPaymentMethodLabel(order.order_type, order.payment.method)
}

function formatDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>

<style scoped>
.customer-orders {
  display: grid;
  gap: calc(var(--spacing) * 4);
  width: min(100%, 52rem);
  margin-inline: auto;
}

.customer-orders__header,
.customer-orders__card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}

.customer-orders__identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
}

.customer-orders__header h1,
.customer-orders__card-heading h2,
.customer-orders__header p,
.customer-orders__kitchen {
  margin: 0;
}

.customer-orders__header p,
.customer-orders__kitchen,
.customer-orders__facts dt {
  color: var(--ui-text-muted);
}

.customer-orders__kitchen-link {
  min-height: auto;
  padding: 0;
  color: var(--ui-text-muted);
}

.customer-orders__loading,
.customer-orders__list {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.customer-orders__skeleton {
  height: 11rem;
}

.customer-orders__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: calc(var(--spacing) * 3);
  margin: calc(var(--spacing) * 4) 0 0;
}

.customer-orders__facts dt {
  font-size: var(--text-xs);
}

.customer-orders__facts dd {
  margin: calc(var(--spacing) * 0.5) 0 0;
}

.customer-orders__kitchen-note {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
  margin: calc(var(--spacing) * 4) 0 0;
  color: var(--ui-error);
}
</style>
