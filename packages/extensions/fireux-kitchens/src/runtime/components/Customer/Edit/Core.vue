<template>
  <ClientOnly>
    <div v-if="customer" class="space-y-6">
      <UCard>
        <template #header>
          <div class="profile-edit__section-header">
            <UIcon name="i-lucide-user-round" />
            Ordering details
          </div>
        </template>

        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Name"
            :firebase-value="customerName"
            placeholder="Your ordering name"
            :maxlength="80"
            :update-function="handleName"
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
                    {{ prediction.structured_formatting?.main_text || prediction.description }}
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

          <MoleculesFormsFirestoreSimpleField
            label="Allergy note"
            type="textarea"
            :rows="3"
            :maxlength="500"
            :firebase-value="allergyNote"
            placeholder="Optional allergy or intolerance note"
            :update-function="handleAllergyNote"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="customer profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref, watch } from 'vue'
import { useCustomer } from '../../../composables/fireux/firestore/profiles/Customer/useCustomer'
import { useMenuDeliveryAddressAutocomplete } from '../../../composables/fireux/public/menu/useMenuDeliveryAddressAutocomplete'

const {
  coreProfile,
  updateCustomerName,
  updateCustomerPhone,
  updateAllergyNote,
  updateDefaultDeliveryAddress,
} = useCustomer()
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
} = useMenuDeliveryAddressAutocomplete(addressDraft)

const customer = computed(() => coreProfile.value ?? null)
const customerPrivate = computed(() => customer.value?.private ?? null)
const customerName = computed(() => customerPrivate.value?.name ?? '')
const customerPhone = computed(() => customerPrivate.value?.phone ?? '')
const allergyNote = computed(() => customerPrivate.value?.allergy_note ?? '')
const defaultDeliveryAddress = computed(
  () => customerPrivate.value?.default_delivery_address ?? ''
)

watch(
  customerPhone,
  (value) => {
    if (savingField.value !== 'phone') phoneDraft.value = value
  },
  { immediate: true }
)

watch(
  defaultDeliveryAddress,
  (value) => {
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
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  wrap(
    () => updateCustomerName(value),
    'Name updated',
    'Failed to update name'
  )

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
      color: 'amber',
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
.profile-edit__section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.customer-address-field {
  display: grid;
  gap: 0.75rem;
}
</style>
