<template>
  <UPage class="supplier-detail" :style="detailStyle">
    <UPageBody class="pagebody">
      <SupplierDetailState
        v-if="outcome !== 'ready' || !supplier || !place"
        :outcome="outcome"
        :has-supplier="Boolean(supplier && place)"
        @refresh="emit('refresh')"
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
          <PlaceHeader v-if="headerPresentation" :place="headerPresentation" />
        </div>

        <div
          class="supplier-detail__content"
          :class="{
            'supplier-detail__content--information-only': !hasEditorialContent,
          }"
        >
          <main v-if="hasEditorialContent" class="supplier-detail__editorial">
            <section v-if="about" class="supplier-detail__about">
              <h2 class="fx-type-section-title">About {{ name }}</h2>
              <p class="supplier-detail__story fx-type-body">{{ about }}</p>
            </section>

            <PlaceDetailGallery
              v-if="headerPresentation?.gallery_images.length"
              :name="name"
              :images="headerPresentation.gallery_images"
            />
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
            <SupplierDetailOperatorPanel :supplier="supplier" />
          </aside>
        </div>

        <DevDebugPanel
          v-if="showDebug"
          object-origin="fetched"
          launcher
          include-route
          title="Supplier DTO"
          context="Supplier detail page · suppliers/[slug] · canonical Supplier and linked Place"
          :objects="supplier ? [supplier] : []"
          :derived="{ company, place, headerPresentation }"
          :default-open="false"
        />
      </article>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Company } from 'fireux-companies/runtime/place/models/company.model'
import type { SupplierDetailOutcome } from '../composables/useSupplierDetail'
import type { Supplier } from '../models/Supplier.model'

const props = defineProps<{
  supplier: Supplier | null
  company: Company | null
  place: Place | null
  outcome: SupplierDetailOutcome
}>()
const emit = defineEmits<{ refresh: [] }>()
const clean = (value: unknown) => String(value ?? '').trim()
const supplier = computed(() => props.supplier)
const name = computed(
  () => clean(props.place?.short_name || props.place?.name) || 'Supplier'
)
const about = computed(() => clean(props.place?.about))
const categories = computed<string[]>(() => [])
const deliveryAreas = computed<string[]>(() =>
  Array.isArray(supplier.value?.delivery_areas)
    ? supplier.value.delivery_areas.map(clean).filter(Boolean)
    : []
)
const headerPresentation = computed<Place | null>(() => {
  const place = props.place
  if (!place) return null
  return {
    ...place,
    name: name.value,
    brand_tagline: clean(place.brand_tagline),
    about: place.about,
    logo_image: place.logo_image,
  }
})
const detailStyle = computed(() => {
  const color = clean(headerPresentation.value?.media_backdrop_color)
  return color
    ? { '--fx-entity-accent': color, '--fx-entity-media-bg': color }
    : undefined
})
const hasEditorialContent = computed(() =>
  Boolean(about.value || headerPresentation.value?.gallery_images.length)
)
const showDebug = import.meta.dev
</script>

<style scoped src="./detail.css"></style>
