<template>
  <div class="write-system">
    <!-- Basic Info -->
    <ProductCreateBasic />

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
                <div
                  v-for="option in productTypeOptions"
                  :key="option.value"
                  class="tooltip-section"
                >
                  <strong>{{ option.label }}:</strong> {{ option.tooltip }}
                </div>
              </div>
            </template>
            <UIcon
              name="i-lucide-help-circle"
              class="w-4 h-4 text-dimmed hover:text-toned cursor-help"
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
            :color="
              product.product_type === option.value ? 'primary' : 'neutral'
            "
            @click="product.product_type = option.value as string"
            class="product-type-button"
          >
            <Icon :name="option.icon" class="w-5 h-5 mr-2" />
            {{ option.label }}
          </UButton>
        </UTooltip>
      </div>
    </UFormField>

    <!-- Pricing -->
    <ProductCreatePrices />

    <!-- Main Product Image -->
    <div class="image-section">
      <FireFormsStateImagePicker
        label="Main Product Image"
        state-key="createProductMainImage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import { useCreateProductState } from '../../composables/create/useCreateProductState'

const { product } = await useCreateProductState()

const runtimeKinds = computed<string[]>(() => {
  const cfg = (useRuntimeConfig().public as any)?.fireux?.products ?? {}
  const kinds = Array.isArray(cfg.productKinds) ? cfg.productKinds : []
  return kinds.length
    ? kinds.map((kind: unknown) => String(kind)).filter(Boolean)
    : ['physical', 'digital', 'service', 'subscription']
})

const iconForKind = (kind: string) => {
  const map: Record<string, string> = {
    physical: 'i-lucide-package',
    digital: 'i-lucide-download',
    service: 'i-lucide-handshake',
    subscription: 'i-lucide-refresh-cw',
    saas_app: 'i-lucide-monitor',
    industry_app: 'i-lucide-building-2',
    white_label_app: 'i-lucide-paintbrush',
    ecosystem_white_label: 'i-lucide-network',
    template: 'i-lucide-layout-template',
    modules_pass: 'i-lucide-box',
  }
  return map[kind] || 'i-lucide-tag'
}

const tooltipForKind = (kind: string) => {
  const map: Record<string, string> = {
    physical: 'Tangible goods requiring shipping and inventory.',
    digital: 'Downloads, software, or files delivered instantly.',
    service: 'Professional services or delivery-based work.',
    subscription: 'Recurring access or membership.',
    saas_app: 'Hosted app sold directly to a business.',
    industry_app: 'Hosted app tailored to a specific industry.',
    white_label_app: 'Single-client hosted app under client branding.',
    ecosystem_white_label: 'Hosted platform for many clients (per tenant).',
    template: 'One-time developer starter you host yourself.',
    modules_pass: 'Optional add-on modules over time.',
  }
  return map[kind] || 'Configured product kind.'
}

const labelForKind = (kind: string) =>
  kind
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const productTypeOptions = computed(() =>
  runtimeKinds.value.map((kind) => ({
    label: labelForKind(kind),
    value: kind,
    icon: iconForKind(kind),
    tooltip: tooltipForKind(kind),
  }))
)
</script>

<style scoped>
.write-system {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6); /* Increased from space-4 to space-6 for more breathing room */
}

.product-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: calc(var(--spacing) * 3);
}

.product-type-button {
  justify-content: flex-start;
  padding: calc(var(--spacing) * 4);
  height: auto;
  text-align: left;
}

.tooltip-content {
  max-width: 300px;
  padding: calc(var(--spacing) * 2);
}

.tooltip-section {
  margin-bottom: calc(var(--spacing) * 2);
  line-height: var(--leading-snug);
}

.tooltip-section strong {
  display: block;
  margin-bottom: var(--spacing);
}

.image-section {
  max-width: 400px;
  margin-top: calc(var(--spacing) * 4);
}
</style>
