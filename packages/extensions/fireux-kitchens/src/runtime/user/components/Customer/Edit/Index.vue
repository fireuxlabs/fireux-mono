<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: edit Customer details in app scope only. -->
<!-- Concurrent edit — 2026-07-21 14:35 CEST — Profile editor CSS pass: let Nuxt UI own the ordering-details card header. -->
<template>
  <ClientOnly>
    <UPageCard
      v-if="customer"
      title="Ordering details"
      icon="i-lucide-user-round"
      variant="outline"
    >
      <div class="space-y-4">
        <FireFormsEditableSimpleField
          label="Name"
          :value="customerName"
          placeholder="Your ordering name"
          :maxlength="80"
          :update="handleName"
        />

        <UFormField label="Phone">
          <UInput
            v-model="phoneDraft"
            autocomplete="tel"
            placeholder="Phone number for delivery updates"
            size="xl"
            maxlength="40"
            :disabled="savingField === 'phone'"
            @blur="savePhone"
            @keydown.enter.prevent="savePhone"
          />
        </UFormField>

        <UFormField label="Default delivery address">
          <div class="customer-address-field">
            <UInput
              v-model="addressDraft"
              autocomplete="street-address"
              placeholder="Start typing your delivery address"
              size="xl"
              maxlength="300"
              :disabled="savingField === 'address'"
              @blur="saveAddress"
              @keydown.enter.prevent="saveAddress"
            />

            <div
              v-if="addressPredictions.length"
              class="menu-order-address-options"
            >
              <button
                v-for="prediction in addressPredictions"
                :key="prediction.place_id"
                type="button"
                @mousedown.prevent="selectAddress(prediction.description)"
              >
                <strong>
                  {{
                    prediction.structured_formatting?.main_text ||
                    prediction.description
                  }}
                </strong>
                <span v-if="prediction.structured_formatting?.secondary_text">
                  {{ prediction.structured_formatting.secondary_text }}
                </span>
              </button>
            </div>

            <p v-if="addressSuggestionsPending" class="text-xs text-dimmed">
              Loading address suggestions...
            </p>

            <p v-if="addressSuggestionsError" class="text-xs text-dimmed">
              {{ addressSuggestionsError }}
            </p>
          </div>
        </UFormField>

        <p v-if="inlineState" class="text-xs text-dimmed">
          {{ inlineState }}
        </p>

        <FireFormsEditableSimpleField
          label="Allergy note"
          type="textarea"
          :rows="3"
          :maxlength="500"
          :value="allergyNote"
          placeholder="Optional allergy or intolerance note"
          :update="handleAllergyNote"
        />
      </div>
    </UPageCard>

    <FireStateCard
      v-else
      entity="customer profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, ref, watch } from 'vue'
import { useCustomer } from '../../../composables/customer/useCustomer'
import { useCustomerUpdate } from '../../../composables/firestore/profiles/Customer/mutations/useCustomerUpdate'
import { useCustomerDeliveryAddressAutocomplete } from '../../../composables/customer/useCustomerDeliveryAddressAutocomplete'

const { customerProfile, profileRefs } = useCustomer()
const {
  updateCustomerName,
  updateCustomerPhone,
  updateAllergyNote,
  updateDefaultDeliveryAddress,
} = useCustomerUpdate(profileRefs)
const toast = useToastify()
type InlineField = 'phone' | 'address'
const phoneDraft = ref('')
const addressDraft = ref('')
const savingField = ref<InlineField | ''>('')
const inlineState = ref('')
const {
  predictions: addressPredictions,
  pending: addressSuggestionsPending,
  error: addressSuggestionsError,
} = useCustomerDeliveryAddressAutocomplete(addressDraft)

const customer = computed(() => customerProfile.value ?? null)
const preferences = computed(() => customer.value?.preferences ?? null)
const customerName = computed(() => preferences.value?.name ?? '')
const customerPhone = computed(() => preferences.value?.phone ?? '')
const allergyNote = computed(() => preferences.value?.allergy_note ?? '')
const defaultDeliveryAddress = computed(
  () => preferences.value?.default_delivery_address ?? ''
)

watch(
  customerPhone,
  (value: string) => {
    if (savingField.value !== 'phone') phoneDraft.value = value
  },
  { immediate: true }
)

watch(
  defaultDeliveryAddress,
  (value: string) => {
    if (savingField.value !== 'address') addressDraft.value = value
  },
  { immediate: true }
)

const wrap = async (
  fn: () => Promise<void>,
  okTitle: string,
  failTitle: string
) => {
  try {
    await fn()
    toast.add({ title: okTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  wrap(() => updateCustomerName(value), 'Name updated', 'Failed to update name')

const handleAllergyNote = async (value: string) =>
  wrap(
    () => updateAllergyNote(value),
    'Allergy note updated',
    'Failed to update allergy note'
  )

async function saveInlineField(
  field: InlineField,
  value: string,
  currentValue: string,
  update: (next: string) => Promise<void>,
  label: string
) {
  const next = value.trim()
  if (next === currentValue.trim() || savingField.value) return

  savingField.value = field
  inlineState.value = `Saving ${label}...`
  try {
    await update(next)
    inlineState.value = `${label} saved`
  } catch (error) {
    inlineState.value = `Failed to save ${label}`
    toast.add({
      title: `Failed to save ${label}`,
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    savingField.value = ''
  }
}

const savePhone = () =>
  saveInlineField(
    'phone',
    phoneDraft.value,
    customerPhone.value,
    updateCustomerPhone,
    'phone'
  )

const saveAddress = () =>
  saveInlineField(
    'address',
    addressDraft.value,
    defaultDeliveryAddress.value,
    updateDefaultDeliveryAddress,
    'delivery address'
  )

function selectAddress(value: string) {
  addressDraft.value = value
  void saveAddress()
}
</script>

<style scoped>
.customer-address-field {
  display: grid;
  gap: calc(var(--spacing) * 3);
}
</style>
