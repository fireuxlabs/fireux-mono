<template>
  <UPage>
    <UPageBody class="pagebody">
      <UAlert
        color="neutral"
        variant="soft"
        title="Redirecting"
        description="Supplier admin routes are legacy. Opening the operator bridge."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const supplierId = computed(() => String(route.params.id || '').trim())

definePageMeta({
  layout: 'default',
  name: 'SuppliersAdminLegacyRedirectPage',
})

await navigateTo(
  supplierId.value
    ? `/suppliers/${encodeURIComponent(supplierId.value)}/operator`
    : '/suppliers'
)
</script>
