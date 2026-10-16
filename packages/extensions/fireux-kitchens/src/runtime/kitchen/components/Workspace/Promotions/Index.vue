<template>
  <section class="mx-auto w-full max-w-4xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UPageHeader
        title="Promotions"
        description="Scheduled offers over your existing food and drinks."
      />
      <UButton
        v-if="
          state.canWrite.value &&
          !editing &&
          ['ready', 'empty'].includes(state.menus.outcome.value)
        "
        label="Add promotion"
        icon="i-lucide-plus"
        @click="editing = 'new'"
      />
    </div>
    <p v-if="state.identity.outcome.value === 'pending'" role="status">
      Loading Kitchen…
    </p>
    <div v-else-if="state.identity.outcome.value === 'error'" role="alert">
      Kitchen could not be loaded.
    </div>
    <p v-else-if="!state.kitchenId.value">
      Choose a Kitchen to view its promotions.
    </p>
    <template v-else>
      <div v-if="state.menus.error.value" role="alert">
        <p>Menus could not be loaded.</p>
        <MoleculesCopyError :message="String(state.menus.error.value)" />
      </div>
      <p v-else-if="state.menus.pending.value" role="status">Loading Menus…</p>
      <div v-if="state.collection.outcome.value === 'error'" role="alert">
        <p>Promotions could not be loaded.</p>
        <MoleculesCopyError :message="String(state.collection.error.value)" />
      </div>
      <p v-else-if="state.collection.pending.value" role="status">
        Loading promotions…
      </p>
      <template v-else>
        <UCard v-for="menu in migrationMenus" :key="menu.id">
          <p class="font-medium">
            Move {{ menu.name }}’s scheduled price to Promotions
          </p>
          <p class="mt-1 text-sm text-muted">
            Keeps its price, days and selected sections. Normal item prices stay
            unchanged.
          </p>
          <UButton
            class="mt-3"
            label="Move scheduled price"
            :disabled="!state.canWrite.value || moving"
            :loading="moving"
            @click="migrate(menu.id)"
          />
        </UCard>
        <WorkspaceKitchenPromotionsEditor
          v-if="editing"
          :key="editing"
          :state="state"
          :promotion="selectedPromotion"
          @close="editing = ''"
        />
        <div v-else-if="state.collection.items.value.length" class="grid gap-4">
          <UCard
            v-for="promotion in state.collection.items.value"
            :key="promotion.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-2">
                <h2 class="text-lg font-semibold">{{ promotion.name }}</h2>
                <p>
                  {{
                    formatCurrencyAmount(promotion.amount_minor / 100, {
                      currencyCode: promotion.currency,
                      format: 'code',
                    })
                  }}
                  per item · {{ menuName(promotion.menu_id) }}
                </p>
                <p class="text-sm text-muted">
                  {{
                    promotion.days
                      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                      .join(', ')
                  }}
                </p>
                <p class="text-sm text-muted">
                  {{
                    promotion.section_ids.length
                      ? 'Selected sections'
                      : 'Whole Menu'
                  }}
                </p>
                <UBadge
                  :label="promotion.status === 'active' ? 'Active' : 'Paused'"
                  :color="promotion.status === 'active' ? 'success' : 'neutral'"
                  variant="soft"
                />
              </div>
              <UButton
                label="Edit"
                color="neutral"
                variant="soft"
                :disabled="!state.canWrite.value"
                @click="editing = promotion.id"
              />
            </div>
          </UCard>
        </div>
        <p
          v-else-if="!editing && !migrationMenus.length"
          class="rounded-xl border border-default p-5 text-muted"
        >
          No promotions yet.
        </p>
      </template>
    </template>
    <div v-if="error" role="alert">
      <p>{{ error }}</p>
      <MoleculesCopyError :message="error" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenPromotions } from '../../../composables/promotions/useKitchenPromotions'
import { formatCurrencyAmount } from '../../../../utils/currency-display'
const state = useKitchenPromotions()
const editing = ref(''),
  moving = ref(false),
  error = ref('')
const selectedPromotion = computed(() =>
  state.collection.items.value.find((row) => row.id === editing.value)
)
const migrationMenus = computed(() =>
  state.menus.menus.value.filter((menu) =>
    Boolean((menu as unknown as { pricing?: unknown }).pricing)
  )
)
const menuName = (id: string) =>
  state.menus.menus.value.find((menu) => menu.id === id)?.name || 'Menu'
watch(state.scopeKey, () => {
  editing.value = ''
  moving.value = false
  error.value = ''
})
async function migrate(menuId: string) {
  const current = state.captureIntent()
  moving.value = true
  error.value = ''
  try {
    await state.migrate(menuId)
  } catch (cause) {
    if (current())
      error.value =
        cause instanceof Error
          ? cause.message
          : 'Could not move scheduled price.'
  } finally {
    if (current()) moving.value = false
  }
}
</script>
