<template>
  <PlaceCollectionManager :collection="collection" />
</template>

<script setup lang="ts">
import type { BasePlace } from '../../../../../models/objects/place.model';

defineProps<{ collection: BasePlace[] }>()
</script>
