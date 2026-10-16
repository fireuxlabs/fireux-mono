<template>
  <KitchenDetailServiceMenu
    :kitchen-slug="kitchenSlug"
    service="room_service"
    :room-number="roomNumber"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { roomServiceRoomNumber } from '../../../../menu/utils/room-service'
definePageMeta({
  name: 'KitchenRoomServiceMenuPage',
  title: 'Room service',
  validate: (route) => Boolean(roomServiceRoomNumber(route.params.room)),
})
const kitchenSlug = useRouteParam('slug')
const room = useRouteParam('room')
const roomNumber = computed(() => roomServiceRoomNumber(room.value))
</script>
