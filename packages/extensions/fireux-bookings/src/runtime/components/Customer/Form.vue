<template>
  <UCard class="bookings-customer-form">
    <template #header>
      <div class="bookings-customer-form__heading">
        <p
          v-if="confirmation?.eyebrow || eyebrow"
          class="bookings-customer-form__eyebrow"
        >
          {{ confirmation?.eyebrow || eyebrow }}
        </p>
        <component
          :is="titleTag"
          class="bookings-customer-form__title"
          :class="{ 'bookings-customer-form__title--page': headingLevel === 1 }"
        >
          {{ confirmation?.title || title }}
        </component>
        <p v-if="confirmation">{{ confirmation.message }}</p>
        <p v-else-if="description">{{ description }}</p>
      </div>
    </template>

    <div
      v-if="confirmation"
      class="bookings-customer-form__confirmation"
      aria-live="polite"
    >
      <dl v-if="confirmation.details?.length">
        <div v-for="detail in confirmation.details" :key="detail.label">
          <dt>{{ detail.label }}</dt>
          <dd>{{ detail.value }}</dd>
        </div>
      </dl>
      <slot name="confirmation-actions" />
    </div>

    <form
      v-else
      class="bookings-customer-form__fields"
      @submit.prevent="submit"
    >
      <slot name="reservation" />

      <UFormField :label="nameLabel" name="guestName">
        <UInput
          class="bookings-customer-form__input"
          :model-value="customer.guestName"
          autocomplete="name"
          maxlength="100"
          required
          @update:model-value="updateText('guestName', $event)"
        />
      </UFormField>

      <UFormField :label="emailLabel" name="guestEmail">
        <UInput
          class="bookings-customer-form__input"
          :model-value="customer.guestEmail"
          type="email"
          autocomplete="email"
          maxlength="254"
          required
          @update:model-value="updateText('guestEmail', $event)"
        />
      </UFormField>

      <UFormField :label="groupSizeLabel" name="groupSize">
        <UInput
          class="bookings-customer-form__input"
          :model-value="customer.groupSize"
          type="number"
          :min="minGroupSize"
          :max="maxGroupSize"
          step="1"
          required
          @update:model-value="updateGroupSize"
        />
      </UFormField>

      <div
        v-if="availability"
        class="bookings-customer-form__availability"
        aria-live="polite"
      >
        <UAlert
          v-if="availability.status !== 'idle'"
          :color="availabilityColor"
          :title="availabilityTitle"
          :description="availability.message"
        />
        <p v-else role="status">{{ availability.message }}</p>
      </div>

      <slot name="availability-actions" />
      <slot name="summary" />

      <UAlert
        v-if="error"
        color="error"
        title="Booking could not be completed"
        :description="error"
      />

      <UButton type="submit" block :disabled="!canSubmit" :loading="pending">
        {{ confirmLabel }}
      </UButton>

      <slot name="footnote" />
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  BookingAvailabilityView,
  BookingConfirmationView,
  BookingCustomerDetails,
} from '../../types/customer-booking-form'

const props = withDefaults(
  defineProps<{
    title: string
    headingLevel?: 1 | 2
    eyebrow?: string
    description?: string
    customer: BookingCustomerDetails
    availability?: BookingAvailabilityView | null
    confirmation?: BookingConfirmationView | null
    error?: string
    pending?: boolean
    canConfirm?: boolean
    confirmLabel?: string
    nameLabel?: string
    emailLabel?: string
    groupSizeLabel?: string
    minGroupSize?: number
    maxGroupSize?: number
  }>(),
  {
    description: '',
    headingLevel: 2,
    eyebrow: '',
    availability: null,
    confirmation: null,
    error: '',
    pending: false,
    canConfirm: true,
    confirmLabel: 'Confirm booking',
    nameLabel: 'Your name',
    emailLabel: 'Email address',
    groupSizeLabel: 'Group size',
    minGroupSize: 1,
    maxGroupSize: 50,
  }
)

const emit = defineEmits<{
  'update:customer': [customer: BookingCustomerDetails]
  submit: [customer: BookingCustomerDetails]
}>()

const titleTag = computed(() => (props.headingLevel === 1 ? 'h1' : 'h2'))
const availabilityColor = computed(() => {
  switch (props.availability?.status) {
    case 'available':
      return 'success'
    case 'unavailable':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'neutral'
  }
})
const availabilityTitle = computed(() => {
  switch (props.availability?.status) {
    case 'pending':
      return 'Checking availability'
    case 'available':
      return 'Time is available'
    case 'unavailable':
      return 'Time is unavailable'
    case 'error':
      return 'Availability could not be checked'
    default:
      return 'Availability'
  }
})
const canSubmit = computed(
  () =>
    !props.pending &&
    props.canConfirm &&
    props.availability?.status === 'available' &&
    Boolean(props.customer.guestName.trim()) &&
    Boolean(props.customer.guestEmail.trim()) &&
    Number.isInteger(props.customer.groupSize) &&
    props.customer.groupSize >= props.minGroupSize &&
    props.customer.groupSize <= props.maxGroupSize
)

function updateText(field: 'guestName' | 'guestEmail', value: unknown) {
  emit('update:customer', {
    ...props.customer,
    [field]: typeof value === 'string' ? value : '',
  })
}

function updateGroupSize(value: unknown) {
  const groupSize = Number(value)
  emit('update:customer', {
    ...props.customer,
    groupSize: Number.isFinite(groupSize) ? groupSize : 0,
  })
}

function submit() {
  if (canSubmit.value) emit('submit', { ...props.customer })
}
</script>

<style scoped>
.bookings-customer-form__title {
  font-size: 1.25rem;
  font-weight: 600;
}
.bookings-customer-form__title--page {
  font-size: 1.875rem;
}

.bookings-customer-form__heading p,
.bookings-customer-form__confirmation dt {
  color: var(--ui-text-muted);
}

.bookings-customer-form__eyebrow {
  font-size: 0.875rem;
  font-weight: 600;
}

.bookings-customer-form__fields,
.bookings-customer-form__confirmation {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.bookings-customer-form__availability {
  width: 100%;
}

.bookings-customer-form__fields :deep(.bookings-customer-form__input) {
  width: 100%;
}

.bookings-customer-form__confirmation dl {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.bookings-customer-form__confirmation dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
