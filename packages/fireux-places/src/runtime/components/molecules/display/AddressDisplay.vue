<template>
  <div class="address-display">
    <div v-if="place?.formatted_address" class="formatted-address">
      <div class="main-address">{{ place.formatted_address }}</div>
      <div
        v-if="showCoordinates && place.geometry?.location"
        class="coordinates"
      >
        <span class="text-sm text-gray-500">
          {{ place.geometry.location.lat.toFixed(6) }},
          {{ place.geometry.location.lng.toFixed(6) }}
        </span>
      </div>
    </div>
    <div v-else-if="simpleAddress" class="simple-address">
      <div class="address-line">
        {{ formatSimpleAddress() }}
      </div>
    </div>
    <div v-else class="no-address">
      <span class="text-gray-500">{{ placeholder || 'No address set' }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  place: { type: Object, default: null },
  simpleAddress: { type: Object, default: null },
  showCoordinates: { type: Boolean, default: false },
  placeholder: { type: String, default: 'No address set' },
})

function formatSimpleAddress() {
  if (!props.simpleAddress) return ''

  const { street, city, state, country, postal_code } = props.simpleAddress
  const parts = [street, city, state, postal_code, country].filter(Boolean)
  return parts.join(', ')
}
</script>

<style scoped>
.address-display {
  padding: 0.5rem;
}

.formatted-address,
.simple-address {
  color: #374151;
}

.main-address,
.address-line {
  font-weight: 500;
  line-height: 1.5;
}

.coordinates {
  margin-top: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.no-address {
  font-style: italic;
}
</style>
