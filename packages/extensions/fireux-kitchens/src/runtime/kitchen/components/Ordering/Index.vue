<template>
  <UContainer class="py-8 sm:py-12">
    <div class="mx-auto max-w-4xl space-y-8">
      <header class="space-y-3">
        <NuxtLink
          :to="backTo"
          class="inline-flex items-center gap-2 text-sm text-muted"
          ><UIcon name="i-lucide-arrow-left" />{{ kitchenName }}</NuxtLink
        >
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Order from {{ kitchenName }}
        </h1>
        <p v-if="choices.length" class="text-muted">
          Choose how you’d like your food, then pick a menu.
        </p>
      </header>
      <MoleculesStateCard v-if="pending" entity="Ordering options" loading />
      <MoleculesStateCard
        v-else-if="error"
        entity="Ordering options"
        state="error"
      />
      <template v-else>
        <UCard v-if="!choices.length">
          <h2 class="text-lg font-semibold">
            Online ordering is currently unavailable
          </h2>
          <p class="mt-2 text-sm text-muted">
            You can still explore the kitchen and its published menus.
          </p>
          <UButton
            :to="backTo"
            label="View kitchen"
            class="mt-4"
            color="neutral"
            variant="soft"
          />
        </UCard>
        <template v-else>
          <nav
            aria-label="How would you like your order?"
            class="grid gap-3 sm:grid-cols-3"
          >
            <button
              v-for="choice in choices"
              :key="choice.type"
              type="button"
              :aria-pressed="selectedType === choice.type"
              class="rounded-2xl border p-5 text-left transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
              :class="
                selectedType === choice.type
                  ? 'border-primary bg-primary/5'
                  : 'border-default'
              "
              @click="selectedType = choice.type"
            >
              <UIcon
                :name="choice.icon"
                class="mb-3 size-6 text-primary"
                aria-hidden="true"
              /><span class="block text-lg font-semibold">{{
                choice.label
              }}</span
              ><span class="mt-1 block text-sm text-muted">{{
                choice.description
              }}</span>
            </button>
          </nav>
          <section
            v-if="selected"
            class="space-y-6"
            :aria-label="selected.label + ' menus'"
          >
            <p v-if="selected.type === 'delivery'" class="text-sm text-muted">
              Delivery availability and charges are checked against your address
              at checkout.
            </p>
            <div
              v-for="offering in selected.offerings"
              :key="offering.id"
              class="space-y-3"
            >
              <KitchenDetailOfferingTimes
                v-if="offering.schedule"
                :offerings="[offering.schedule]"
                compact
              />
              <h2 v-else class="text-lg font-semibold">{{ offering.name }}</h2>
              <div class="grid gap-3 sm:grid-cols-2">
                <NuxtLink
                  v-for="menu in offering.menus"
                  :key="menu.id"
                  :to="menu.to"
                  class="group flex items-center justify-between gap-4 rounded-2xl border border-default bg-default p-5 transition-colors hover:bg-elevated"
                >
                  <div>
                    <h3 class="font-semibold">{{ menu.name }}</h3>
                    <p
                      v-if="menu.description"
                      class="mt-1 line-clamp-2 text-sm text-muted"
                    >
                      {{ menu.description }}
                    </p>
                    <p class="mt-3 text-sm text-primary">
                      Choose from this menu
                    </p>
                  </div>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                </NuxtLink>
              </div>
            </div>
          </section>
        </template>
        <UButton
          v-if="hasMore"
          label="Show more menus"
          :loading="loadingMore"
          color="neutral"
          variant="soft"
          @click="loadMore()"
        />
        <MoleculesCopyError
          v-if="loadMoreError"
          message="More menus could not be loaded. Please try again."
        />
      </template>
    </div>
  </UContainer>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenDetail } from '../../composables/useKitchenDetail'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../utils/kitchen-menu-route'
import {
  kitchenOrderingChoices,
  type KitchenOnlineOption,
} from '../../utils/kitchen-ordering-choices'
const props = defineProps<{ kitchenSlug?: string }>()
const fireux = useFireUXConfig()
const scope = computed(() =>
  props.kitchenSlug
    ? directoryMenuRouteScope(props.kitchenSlug)
    : tenantMenuRouteScope()
)
const {
  collection,
  pending,
  error,
  ready,
  hasMore,
  loadingMore,
  loadMoreError,
  loadMore,
} = useMenuDirectory({ routeScope: scope, pageSize: 50 })
const detail = useKitchenDetail(computed(() => props.kitchenSlug))
const choices = computed(() =>
  !pending.value && !error.value
    ? kitchenOrderingChoices(collection.value, scope.value)
    : []
)
const selectedType = ref<KitchenOnlineOption>()
watch(
  choices,
  (options) => {
    if (!options.some((option) => option.type === selectedType.value))
      selectedType.value = options[0]?.type
  },
  { immediate: true }
)
const selected = computed(() =>
  choices.value.find((option) => option.type === selectedType.value)
)
const kitchenName = computed(
  () =>
    detail.presentation.value?.display_name ||
    collection.value[0]?.kitchen?.name ||
    collection.value[0]?.source?.kitchen_name ||
    fireux.appName ||
    'the kitchen'
)
const backTo = computed(() =>
  props.kitchenSlug ? '/kitchens/' + encodeURIComponent(props.kitchenSlug) : '/'
)
useSeoMeta({
  title: () => 'Order from ' + kitchenName.value,
  robots: 'noindex, follow',
})
await Promise.all([ready, detail.ready])
</script>
