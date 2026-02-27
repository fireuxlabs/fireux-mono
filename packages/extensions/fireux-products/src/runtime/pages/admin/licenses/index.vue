<template>
  <UPage>
    <UPageHeader class="border-b-0"
      title="Template Licenses"
      description="Paid buyers awaiting access delivery."
    />
    <UPageBody class="space-y-4">
      <UAlert
        color="neutral"
        variant="subtle"
        title="Delivery policy"
        description="v1 uses manual private repo invites after payment."
      />

      <div v-if="pending" class="space-y-2">
        <USkeleton v-for="n in 4" :key="n" class="h-16" />
      </div>

      <UAlert
        v-else-if="errorText"
        color="error"
        title="Failed to load licenses"
        :description="errorText"
      />

      <UCard v-else-if="!licenses.length">
        <p class="text-sm text-[var(--ui-text-muted)]">
          No licenses found for this app yet.
        </p>
      </UCard>

      <div v-else class="space-y-3">
        <UCard v-for="license in licenses" :key="license.id">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-medium">Buyer hidden</p>
              <p class="text-xs text-[var(--ui-text-muted)]">
                Product: {{ license.product_slug || '-' }}
              </p>
              <p class="text-xs text-[var(--ui-text-muted)]">
                Session: {{ license.checkout_session_id || '-' }}
              </p>
            </div>
            <UBadge color="amber" variant="soft">
              {{ license.delivery_status || 'pending' }}
            </UBadge>
          </div>
        </UCard>
      </div>

      <DevJson
        :title="'Template Licenses (JSON)'"
        context="admin/licenses"
        :data="licenses"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFetch } from '#app'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'

definePageMeta({
  layout: 'console',
  title: 'Template Licenses',
  requiresAuth: true,
  roles: ['admin'],
})

const { appId } = useFireUXConfig()

const { data, pending, error } = await useFetch('/api/products/licenses', {
  query: { appId },
})

const licenses = computed(() => {
  const payload = data.value as { licenses?: Array<Record<string, any>> } | null
  return Array.isArray(payload?.licenses) ? payload.licenses : []
})

const errorText = computed(() => {
  const value = error.value
  if (!value) return ''
  return value instanceof Error ? value.message : 'Unknown error'
})
</script>
