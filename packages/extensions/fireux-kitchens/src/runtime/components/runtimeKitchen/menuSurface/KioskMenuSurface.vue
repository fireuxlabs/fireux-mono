<template>
  <UPage>
    <UPageHeader :title="headerTitle" :description="headerDescription">
      <template #ctas>
        <UButton
          size="sm"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="backToKitchen"
        >
          Back
        </UButton>
        <UButton
          v-if="itemCount > 0 && canCheckout"
          size="sm"
          variant="solid"
          icon="i-lucide-shopping-basket"
          :to="checkoutRoute"
        >
          Basket · {{ itemCount }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-8">
      <div v-if="loading" class="py-12 text-center text-sm text-dimmed">
        Loading kiosk menu...
      </div>

      <UAlert
        v-else-if="!resolvedKitchen"
        color="neutral"
        variant="soft"
        title="Kitchen not found"
        description="We could not resolve this kitchen from the current route."
      />

      <template v-else>
        <UCard class="overflow-hidden">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-2">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Kiosk Surface
              </div>
              <div class="space-y-1">
                <h2 class="text-2xl font-semibold tracking-tight">
                  {{ resolvedKitchen.name || 'Kitchen' }}
                </h2>
                <p v-if="kitchenAddress" class="text-sm text-dimmed">
                  {{ kitchenAddress }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
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
          </div>
        </UCard>

        <UAlert
          v-if="basketKitchenMismatch"
          color="warning"
          variant="soft"
          title="Basket has a different kitchen"
          description="Adding here will start a new basket for this kitchen."
        />

        <UCard v-if="sortedMenus.length">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Choose Menu</div>
              <div class="text-xs text-dimmed">
                Same menu canon, rendered for a larger touch-first ordering
                surface.
              </div>
            </div>
          </template>

          <div class="flex flex-wrap gap-3">
            <UButton
              v-for="menu in sortedMenus"
              :key="menu.id || menu.name"
              size="lg"
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

        <div v-else class="space-y-8">
          <section
            v-for="section in sortedSections"
            :key="section.id || section.label"
            class="space-y-4"
          >
            <div class="space-y-1">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-dimmed">
                {{ selectedMenu.name || 'Menu' }}
              </div>
              <h3 class="text-2xl font-semibold tracking-tight">
                {{ section.label || 'Section' }}
              </h3>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <UCard
                v-for="group in section.itemGroups"
                :key="group.key"
                class="overflow-hidden"
              >
                <div class="space-y-4">
                  <div
                    v-for="item in group.items"
                    :key="item.id || item.label"
                    class="overflow-hidden rounded-2xl border border-default bg-[var(--ui-bg-elevated)]"
                  >
                    <img
                      v-if="item.photo_url"
                      :src="item.photo_url"
                      :alt="item.label || group.label || 'Menu item'"
                      class="h-48 w-full object-cover"
                      loading="lazy"
                    />

                    <div class="space-y-4 p-4">
                      <div class="space-y-2">
                        <div
                          v-if="group.items.length > 1"
                          class="text-xs font-semibold uppercase tracking-[0.16em] text-dimmed"
                        >
                          {{ group.label }}
                        </div>
                        <h4 class="text-xl font-semibold tracking-tight">
                          {{
                            group.items.length > 1
                              ? resolveVariantLabel(group.label, item.label)
                              : item.label || 'Menu item'
                          }}
                        </h4>
                        <p v-if="item.description" class="text-sm text-dimmed">
                          {{ item.description }}
                        </p>
                      </div>

                      <div class="flex items-center justify-between gap-3">
                        <div class="text-lg font-semibold">
                          {{ formatPrice(item.price_minor, item.currency_code) }}
                        </div>
                        <UButton
                          size="lg"
                          color="primary"
                          @click="handleAddToBasket(group, item)"
                        >
                          Add
                        </UButton>
                      </div>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </section>
        </div>

        <UCard v-if="itemCount > 0">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">
                  Basket · {{ itemCount }} item{{ itemCount === 1 ? '' : 's' }}
                </div>
                <div class="text-xs text-dimmed">
                  Ready to continue to checkout.
                </div>
              </div>
              <UButton
                v-if="canCheckout"
                size="lg"
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
              class="flex items-center justify-between gap-3 rounded-xl border border-default p-3"
            >
              <div class="min-w-0">
                <div class="truncate text-base font-medium">{{ line.label }}</div>
                <div class="text-xs text-dimmed">
                  {{ formatPrice(line.price_minor, line.currency_code) }} each
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  size="sm"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-minus"
                  @click="decrementAt(index)"
                />
                <div class="w-8 text-center text-base font-semibold">
                  {{ line.qty }}
                </div>
                <UButton
                  size="sm"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-plus"
                  @click="incrementAt(index)"
                />
                <UButton
                  size="sm"
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
              <div class="text-lg font-semibold">
                {{ formatPrice(subtotalMinor, currencyCode) }}
              </div>
            </div>
          </template>
        </UCard>
      </template>
    </UPageBody>

    <UButton
      v-if="itemCount > 0 && canCheckout"
      class="fixed bottom-5 right-5 z-[60] rounded-full px-5 shadow-lg"
      icon="i-lucide-shopping-basket"
      size="xl"
      :to="checkoutRoute"
    >
      Checkout · {{ itemCount }} · {{ formatPrice(subtotalMinor, currencyCode) }}
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
