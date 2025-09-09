<template>
  <div class="write-system">
    <!-- Basic Info -->
    <FireOrganismsProductCreateBasic />

    <!-- Product Type -->
    <UFormField
      label="Product Type"
      description="Choose the type that best describes your product"
    >
      <template #label>
        <div class="flex items-center gap-2">
          <span>Product Type</span>
          <UTooltip :popper="{ placement: 'right' }">
            <template #text>
              <div class="tooltip-content">
                <div class="tooltip-section">
                  <strong>📦 Physical:</strong> Tangible goods requiring
                  shipping & inventory
                </div>
                <div class="tooltip-section">
                  <strong>💾 Digital:</strong> Downloads, software, eBooks -
                  instant delivery
                </div>
                <div class="tooltip-section">
                  <strong>🤝 Service:</strong> Professional services,
                  consulting, one-time work
                </div>
                <div class="tooltip-section">
                  <strong>🔄 Subscription:</strong> Recurring access, SaaS,
                  memberships
                </div>
                <hr class="my-2 border-gray-600" />
                <div class="text-xs text-gray-400">
                  <div>• Physical/Digital: One-time payments</div>
                  <div>• Service: One-time or recurring</div>
                  <div>• Subscription: Always recurring</div>
                </div>
              </div>
            </template>
            <UIcon
              name="i-lucide-help-circle"
              class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
            />
          </UTooltip>
        </div>
      </template>
      <div class="product-type-grid">
        <UTooltip
          v-for="option in productTypeOptions"
          :key="option.value"
          :text="option.tooltip"
          :popper="{ placement: 'top' }"
        >
          <UButton
            :variant="
              product.product_type === option.value ? 'solid' : 'outline'
            "
            :color="product.product_type === option.value ? 'primary' : 'gray'"
            @click="
              product.product_type = option.value as
                | 'physical'
                | 'digital'
                | 'service'
                | 'subscription'
            "
            class="product-type-button"
          >
            <Icon :name="option.icon" class="w-5 h-5 mr-2" />
            {{ option.label }}
          </UButton>
        </UTooltip>
      </div>
    </UFormField>

    <!-- Pricing -->
    <FireOrganismsProductCreatePrices />

    <!-- Stock & Capacity Management -->
    <FireOrganismsProductCreateStock />

    <!-- Shiping -->
    <!-- <FireOrganismsProductCreateShipping /> -->

    <!-- Main Product Image -->
    <div class="image-section">
      <FireMoleculesFormsStateImagePicker
        label="Main Product Image"
        state-key="createProductMainImage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'

const { product } = await useCreateProductState()

const productTypeOptions = [
  {
    label: 'Physical',
    value: 'physical',
    icon: 'i-lucide-package',
    tooltip:
      'Physical goods that need to be shipped. Includes inventory tracking, shipping calculations, and stock management.',
  },
  {
    label: 'Digital',
    value: 'digital',
    icon: 'i-lucide-download',
    tooltip:
      'Digital products like eBooks, software, or downloadable content. Instant delivery, no shipping required.',
  },
  {
    label: 'Service',
    value: 'service',
    icon: 'i-lucide-handshake',
    tooltip:
      'One-time services like consulting, design work, or professional services. Can be billed once or recurring.',
  },
  {
    label: 'Subscription',
    value: 'subscription',
    icon: 'i-lucide-refresh-cw',
    tooltip:
      'Recurring access to products/services. Automatically billed monthly or yearly (SaaS, memberships, etc.).',
  },
]
</script>

<style scoped>
.write-system {
  display: flex;
  flex-direction: column;
  gap: var(
    --space-6
  ); /* Increased from space-4 to space-6 for more breathing room */
}

.product-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
}

.product-type-button {
  justify-content: flex-start;
  padding: var(--space-4);
  height: auto;
  text-align: left;
}

.tooltip-content {
  max-width: 300px;
  padding: var(--space-2);
}

.tooltip-section {
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.tooltip-section strong {
  display: block;
  margin-bottom: var(--space-1);
}

.image-section {
  max-width: 400px;
  margin-top: var(--space-4);
}
</style>
