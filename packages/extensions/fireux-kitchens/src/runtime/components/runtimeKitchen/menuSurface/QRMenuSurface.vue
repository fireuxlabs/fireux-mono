<template>
  <UPage>
    <UPageHeader :title="headerTitle" :description="headerDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="backToKitchen"
        >
          Back
        </UButton>
        <UButton
          v-if="itemCount > 0 && canCheckout"
          size="xs"
          variant="soft"
          icon="i-lucide-shopping-basket"
          :to="checkoutRoute"
        >
          Basket · {{ itemCount }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <div v-if="loading" class="py-10 text-sm text-dimmed">
        Loading menu...
      </div>

      <UAlert
        v-else-if="!resolvedKitchen"
        color="neutral"
        variant="soft"
        title="Kitchen not found"
        description="We could not resolve this kitchen from the current route."
      />

      <template v-else>
        <UCard>
          <div class="space-y-1">
            <div class="text-sm font-semibold">
              {{ resolvedKitchen.name || 'Kitchen' }}
            </div>
            <div v-if="kitchenAddress" class="text-xs text-dimmed">
              {{ kitchenAddress }}
            </div>
          </div>

          <div
            v-if="requestedModeLabel || requestedTable || requestedCover"
            class="mt-3 flex flex-wrap items-center gap-2"
          >
            <UBadge v-if="requestedModeLabel" variant="soft" color="neutral">
              {{ requestedModeLabel }}
            </UBadge>
            <UBadge v-if="requestedTable" variant="soft" color="neutral">
              Table {{ requestedTable }}
            </UBadge>
            <UBadge v-if="requestedCover" variant="soft" color="neutral">
              Cover {{ requestedCover }}
            </UBadge>
          </div>
        </UCard>

        <UAlert
          v-if="basketKitchenMismatch"
          color="warning"
          variant="soft"
          title="Basket has a different kitchen"
          description="Adding here will start a new basket for this kitchen."
        />

        <UCard v-if="itemCount > 0">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold">
                Basket · {{ itemCount }} item{{ itemCount === 1 ? '' : 's' }}
              </div>
              <UButton
                v-if="canCheckout"
                size="xs"
                variant="soft"
                icon="i-lucide-shopping-basket"
                :to="checkoutRoute"
              >
                Checkout
              </UButton>
            </div>
          </template>

          <div class="space-y-2">
            <div
              v-for="(line, index) in basketItems"
              :key="lineKey(line, index)"
              class="flex items-center justify-between gap-3 rounded border border-default p-2.5"
            >
              <div class="min-w-0">
                <div class="truncate text-sm font-medium">{{ line.label }}</div>
                <div class="text-xs text-dimmed">
                  {{ formatPrice(line.price_minor, line.currency_code) }} each
                </div>
              </div>

              <div class="flex items-center gap-1">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-minus"
                  @click="decrementAt(index)"
                />
                <div class="w-6 text-center text-sm font-medium">
                  {{ line.qty }}
                </div>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-plus"
                  @click="incrementAt(index)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="removeAt(index)"
                />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-between">
              <div class="text-sm text-dimmed">Subtotal</div>
              <div class="text-sm font-semibold">
                {{ formatPrice(subtotalMinor, currencyCode) }}
              </div>
            </div>
          </template>
        </UCard>

        <UCard v-if="sortedMenus.length">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Menus</div>
              <div class="text-xs text-dimmed">
                Active menus are selectable. Current service mode filters menu
                availability.
              </div>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="menu in sortedMenus"
              :key="menu.id || menu.name"
              size="xs"
              :variant="isSelectedMenu(menu) ? 'solid' : 'soft'"
              :color="isMenuSelectable(menu) ? 'primary' : 'neutral'"
              :disabled="!isMenuSelectable(menu)"
              :to="isMenuSelectable(menu) ? resolveMenuTo(menu) : undefined"
            >
              {{ menu.name || 'Untitled menu' }}
            </UButton>
          </div>
        </UCard>

        <UAlert
          v-if="!selectedMenu"
          color="neutral"
          variant="soft"
          :title="
            requestedModeLabel
              ? `No ${requestedModeLabel} menu available`
              : 'No active menu available'
          "
          :description="noMenuDescription"
        />

        <div v-else class="space-y-6">
          <UCard
            v-for="section in sortedSections"
            :key="section.id || section.label"
          >
            <template #header>
              <div class="space-y-1">
                <div class="text-base font-semibold">
                  {{ section.label || 'Section' }}
                </div>
                <USeparator />
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="group in section.itemGroups"
                :key="group.key"
                class="rounded border border-default p-3"
              >
                <div
                  v-if="group.items.length > 1"
                  class="mb-2 text-sm font-semibold"
                >
                  {{ group.label }}
                </div>

                <div class="space-y-2">
                  <div
                    v-for="item in group.items"
                    :key="item.id || item.label"
                    class="flex items-start justify-between gap-4"
                  >
                    <div class="min-w-0 space-y-1">
                      <div class="font-medium">
                        {{
                          group.items.length > 1
                            ? resolveVariantLabel(group.label, item.label)
                            : item.label || 'Menu item'
                        }}
                      </div>
                      <div v-if="item.description" class="text-sm text-dimmed">
                        {{ item.description }}
                      </div>
                    </div>

                    <div class="flex shrink-0 items-center gap-3">
                      <div class="min-w-[5rem] text-right text-sm font-semibold">
                        {{ formatPrice(item.price_minor, item.currency_code) }}
                      </div>
                      <UButton
                        size="xs"
                        variant="soft"
                        color="neutral"
                        @click="handleAddToBasket(group, item)"
                      >
                        Add to basket
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </UPageBody>

    <UButton
      v-if="itemCount > 0 && canCheckout"
      class="fixed bottom-5 right-5 z-[60] rounded-full shadow-lg"
      icon="i-lucide-shopping-basket"
      size="lg"
      :to="checkoutRoute"
    >
      Basket · {{ itemCount }} · {{ formatPrice(subtotalMinor, currencyCode) }}
    </UButton>
  </UPage>
</template>

<script setup lang="ts">
import type { KitchenMenuSurfaceState } from '../../../composables/fireux/app/useKitchenMenuSurface'
import type { KitchenConsoleMenuSurfaceState } from '../../../composables/fireux/app/useKitchenConsoleMenuSurface'
import type { KitchenDemoMenuSurfaceState } from '../../../composables/fireux/app/useKitchenDemoMenuSurface'

const props = defineProps<{
  surface:
    | KitchenMenuSurfaceState
    | KitchenConsoleMenuSurfaceState
    | KitchenDemoMenuSurfaceState
}>()

const {
  backToKitchen,
  basketItems,
  basketKitchenMismatch,
  canCheckout,
  checkoutRoute,
  currencyCode,
  decrementAt,
  formatPrice,
  handleAddToBasket,
  headerDescription,
  headerTitle,
  incrementAt,
  isMenuSelectable,
  isSelectedMenu,
  itemCount,
  kitchenAddress,
  lineKey,
  loading,
  noMenuDescription,
  removeAt,
  requestedCover,
  requestedModeLabel,
  requestedTable,
  resolveMenuTo,
  resolveVariantLabel,
  resolvedKitchen,
  selectedMenu,
  sortedMenus,
  sortedSections,
  subtotalMinor,
} = props.surface
</script>
