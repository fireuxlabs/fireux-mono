<template>
  <div class="space-y-6">
    <header
      class="space-y-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p class="text-sm text-muted">
        Collection order #{{ submission.order.number }}
      </p>
      <h3 class="text-xl font-semibold">{{ responseTitle }}</h3>
      <p>{{ responseMessage }}</p>
      <p v-if="submission.message" class="font-medium">
        {{ submission.message }}
      </p>
      <p
        v-if="
          submission.estimate_minutes &&
          ['accepted', 'preparing'].includes(submission.state)
        "
        class="text-sm"
      >
        Kitchen estimate: {{ submission.estimate_minutes }} minutes.
      </p>
    </header>
    <section
      v-if="venue"
      class="space-y-1 border-y border-default py-4"
      aria-label="Collection details"
    >
      <h3 class="text-sm text-muted">
        {{
          ['declined', 'completed'].includes(submission.state)
            ? 'Venue'
            : 'Collect from'
        }}
      </h3>
      <p class="font-semibold">{{ venue.display_name }}</p>
      <p v-if="venue.formatted_address || venue.short_address" class="text-sm">
        {{ venue.formatted_address || venue.short_address }}
      </p>
      <div class="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm">
        <a
          v-if="venue.google_maps_url"
          :href="venue.google_maps_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
          >Directions</a
        >
        <a
          v-if="venue.phone"
          :href="`tel:${venue.phone}`"
          class="text-primary hover:underline"
          >{{ venue.phone }}</a
        >
      </div>
    </section>
    <section aria-label="Order items" class="space-y-4">
      <ul class="divide-y divide-default">
        <li
          v-for="line in submission.order.lines"
          :key="line.id"
          class="py-3 first:pt-0"
        >
          <div class="flex items-start justify-between gap-4">
            <p class="min-w-0 break-words font-medium">
              {{ line.quantity }} × {{ line.item.name }}
            </p>
            <span
              v-if="linePrice(line.id) !== undefined"
              class="shrink-0 tabular-nums"
              >{{ money(linePrice(line.id)) }}</span
            >
          </div>
          <ul
            v-if="line.notes?.length"
            class="mt-1 space-y-1 text-sm text-muted"
            aria-label="Item choices"
          >
            <li v-for="(note, index) in line.notes" :key="index">{{ note }}</li>
          </ul>
        </li>
      </ul>
      <div
        v-if="submission.pricing"
        class="flex justify-between gap-4 border-t border-default pt-4 text-lg font-semibold"
      >
        <span>Total · {{ submission.pricing.currency }}</span>
        <span class="tabular-nums">{{ money(submission.pricing.total) }}</span>
      </div>
    </section>
    <div v-if="error" role="alert" class="space-y-2 text-sm">
      <p>Order updates are unavailable. Your order is still saved.</p>
      <MoleculesCopyError :message="error" />
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
