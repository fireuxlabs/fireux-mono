<template>
  <div>
    <header role="status" aria-live="polite" aria-atomic="true">
      <p>
        {{
          submission.order.channel === 'kiosk' ? 'Order' : 'Collection order'
        }}
        #{{ submission.order.number }}
      </p>
      <h3>{{ responseTitle }}</h3>
      <p>{{ responseMessage }}</p>
      <p v-if="submission.message">
        {{ submission.message }}
      </p>
      <p
        v-if="
          submission.estimate_minutes &&
          ['accepted', 'preparing'].includes(submission.state)
        "
      >
        Kitchen estimate: {{ submission.estimate_minutes }} minutes.
      </p>
    </header>
    <section v-if="venue" aria-label="Collection details">
      <h3>
        {{
          ['declined', 'completed'].includes(submission.state)
            ? 'Venue'
            : 'Collect from'
        }}
      </h3>
      <p>{{ venue.display_name }}</p>
      <p v-if="venue.formatted_address || venue.short_address">
        {{ venue.formatted_address || venue.short_address }}
      </p>
      <div>
        <a
          v-if="venue.google_maps_url"
          :href="venue.google_maps_url"
          target="_blank"
          rel="noopener noreferrer"
          >Directions</a
        >
        <a v-if="venue.phone" :href="`tel:${venue.phone}`">{{ venue.phone }}</a>
      </div>
    </section>
    <section aria-label="Order items">
      <ul>
        <li v-for="line in submission.order.lines" :key="line.id">
          <div>
            <p>{{ line.quantity }} × {{ line.item.name }}</p>
            <span v-if="linePrice(line.id) !== undefined">{{
              money(linePrice(line.id))
            }}</span>
          </div>
          <ul v-if="line.notes?.length" aria-label="Item choices">
            <li v-for="(note, index) in line.notes" :key="index">{{ note }}</li>
          </ul>
        </li>
      </ul>
      <div v-if="submission.pricing">
        <span>Total · {{ submission.pricing.currency }}</span>
        <span>{{ money(submission.pricing.total) }}</span>
      </div>
    </section>
    <div v-if="error" role="alert">
      <p>Order updates are unavailable. Your order is still saved.</p>
      <FireCopyError :message="error" />
      <UButton
        label="Check for updates"
        variant="soft"
        color="neutral"
        :loading="pending"
        @click="emit('refresh')"
      />
    </div>
    <UButton
      label="Start another order"
      variant="link"
      color="neutral"
      :disabled="pending"
      @click="emit('reset')"
    />
  </div>
</template>
<script setup lang="ts">
import type { OrderSubmission } from '../../../kitchen/models/order-submission.model'
import type { KitchenDetailPresentation } from '../../../kitchen/models/kitchen-detail.response'
import { formatCurrencyAmount } from '../../../utils/currency-display'
const props = defineProps<{
  submission: OrderSubmission
  responseTitle: string
  responseMessage: string
  venue?: KitchenDetailPresentation | null
  pending: boolean
  error?: string
}>()
const emit = defineEmits<{ reset: []; refresh: [] }>()
const linePrice = (id: string) =>
  props.submission.pricing?.lines.find((line) => line.line_id === id)?.total
const money = (amount: number | undefined) =>
  amount === 0
    ? '0'
    : formatCurrencyAmount(amount || 0, {
        currencyCode: props.submission.pricing?.currency || '',
        showCurrency: false,
      })
</script>
