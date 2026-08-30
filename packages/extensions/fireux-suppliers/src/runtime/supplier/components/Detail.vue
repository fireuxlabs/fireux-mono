<template>
  <div class="supplier-detail" :style="detailStyle">
    <SupplierDetailState
      v-if="outcome !== 'ready' || !supplier || !place"
      :outcome="outcome"
      :has-supplier="Boolean(supplier && place)"
      @refresh="refresh"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierDetail } from '../composables/useSupplierDetail'
import { useSupplierSeo } from '../composables/useSupplierSeo'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Supplier } from '../models/Supplier.model'

const props = defineProps<{ supplier: Supplier }>()
const { supplier, company, place, outcome, refresh } = useSupplierDetail(
  computed(() => props.supplier.id)
)
const clean = (value: unknown) => String(value ?? '').trim()
const name = computed(
  () => clean(place.value?.short_name || place.value?.name) || 'Supplier'
)
const about = computed(() => clean(place.value?.about))
const categories = computed<string[]>(() => [])
const deliveryAreas = computed<string[]>(() =>
  Array.isArray(supplier.value?.delivery_areas)
    ? supplier.value.delivery_areas.map(clean).filter(Boolean)
    : []
)
const headerPresentation = computed<Place | null>(() => {
  const value = place.value
  if (!value) return null
  return {
    ...value,
    name: name.value,
    tagline: clean(value.tagline),
    about: value.about,
    logo_image: value.logo_image,
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
useSupplierSeo(supplier, place)
</script>

<style scoped src="./detail.css"></style>
