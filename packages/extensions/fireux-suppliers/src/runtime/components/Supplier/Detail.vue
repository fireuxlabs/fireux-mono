<template>
  <UPage class="supplier-detail" :style="detailStyle">
    <UPageBody class="pagebody">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading supplier…</p>
      </UPageCard>
      <UPageCard
        v-else-if="!supplier"
        title="Supplier not found"
        description="This supplier is not available."
        variant="subtle"
      />

      <article v-else class="supplier-detail__page">
        <div class="supplier-detail__hero">
          <nav class="supplier-detail__toolbar" aria-label="Supplier directory">
            <UButton
              to="/suppliers"
              label="All suppliers"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
              class="supplier-detail__back"
            />
          </nav>
          <PlaceHeader v-if="placePresentation" :place="placePresentation" />
        </div>

        <div class="supplier-detail__content">
          <main class="supplier-detail__editorial">
            <section v-if="about" class="supplier-detail__about">
              <h2 class="fx-type-section-title">About {{ name }}</h2>
              <p class="supplier-detail__story fx-type-body">{{ about }}</p>
            </section>

            <PlaceDetailGallery
              v-if="placePresentation?.gallery_images.length"
              :name="name"
              :images="placePresentation.gallery_images"
            />

            <section v-if="items.length" class="supplier-detail__catalogue">
              <h2 class="fx-type-section-title">Catalogue</h2>
              <div class="supplier-detail__items">
                <UCard v-for="item in items" :key="item.id" variant="subtle">
                  <p class="fx-type-card-heading">
                    {{ item.name || item.product_id }}
                  </p>
                  <p v-if="item.description" class="text-sm text-toned">
                    {{ item.description }}
                  </p>
                  <div class="supplier-detail__item-facts">
                    <UBadge
                      v-if="item.pack_size_label"
                      color="neutral"
                      variant="soft"
                    >
                      {{ item.pack_size_label }}
                    </UBadge>
                    <UBadge
                      v-if="item.availability_state"
                      color="neutral"
                      variant="soft"
                    >
                      {{ item.availability_state }}
                    </UBadge>
                  </div>
                </UCard>
              </div>
            </section>
          </main>

          <aside class="supplier-detail__aside">
            <UCard v-if="categories.length" variant="subtle">
              <template #header
                ><h2 class="fx-type-card-heading">Supplies</h2></template
              >
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="category in categories"
                  :key="category"
                  color="neutral"
                  variant="soft"
                >
                  {{ category }}
                </UBadge>
              </div>
            </UCard>
            <UCard v-if="deliveryAreas.length" variant="subtle">
              <template #header
                ><h2 class="fx-type-card-heading">Delivery areas</h2></template
              >
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="area in deliveryAreas"
                  :key="area"
                  color="neutral"
                  variant="soft"
                >
                  {{ area }}
                </UBadge>
              </div>
            </UCard>
            <SupplierPublicOperatorPanel :supplier="supplier" />
          </aside>
        </div>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Supplier DTO"
          context="Supplier detail page · suppliers/[slug] · Supplier and linked Place"
          :objects="supplier"
          :derived="{ place: placePresentation }"
          :default-open="false"
        />
      </article>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { PublicCompanyDetailResponse } from 'fireux-companies/runtime/models/company-public.model'
import type { PublicPlaceDetailProjection } from 'fireux-places/runtime/models/place-public.model'

const props = defineProps<{
  supplier: Record<string, any> | null
  pending: boolean
}>()
const clean = (value: unknown) => String(value ?? '').trim()
const supplier = computed(() => props.supplier)
const companyId = computed(() => clean(supplier.value?.company_id))
const companyPath = computed(() =>
  companyId.value ? `/api/companies/${encodeURIComponent(companyId.value)}` : ''
)
const { data: companyResponse } =
  useAsyncData<PublicCompanyDetailResponse | null>(
    () => `supplier-company|${companyId.value}`,
    () =>
      companyPath.value
        ? $fetch<PublicCompanyDetailResponse>(companyPath.value)
        : Promise.resolve(null),
    {
      watch: [companyPath],
    }
  )
const name = computed(
  () => clean(supplier.value?.supplier_organization_name) || 'Supplier'
)
const about = computed(() =>
  clean(supplier.value?.supplier_bio || supplier.value?.summary)
)
const categories = computed<string[]>(() =>
  Array.isArray(supplier.value?.supplier_item_categories)
    ? supplier.value.supplier_item_categories.map(clean).filter(Boolean)
    : []
)
const deliveryAreas = computed<string[]>(() =>
  Array.isArray(supplier.value?.supplier_delivery_areas)
    ? supplier.value.supplier_delivery_areas.map(clean).filter(Boolean)
    : []
)
const items = computed(() =>
  Array.isArray(supplier.value?.items) ? supplier.value.items : []
)
const placePresentation = computed<PublicPlaceDetailProjection | null>(() => {
  const place = companyResponse.value?.item
  if (!place) return null
  return {
    ...place,
    name: name.value,
    brand_tagline: clean(
      supplier.value?.tagline ||
        supplier.value?.supplier_headline ||
        place.brand_tagline
    ),
    about: about.value || place.about,
    logo_image: clean(supplier.value?.supplier_image) || place.logo_image,
  }
})
const detailStyle = computed(() => {
  const color = clean(placePresentation.value?.media_backdrop_color)
  return color
    ? { '--fx-entity-accent': color, '--fx-entity-media-bg': color }
    : undefined
})
</script>

<style scoped src="./detail.css"></style>
