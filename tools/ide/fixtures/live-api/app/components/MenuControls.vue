<template>
  <fieldset>
    <legend>Menu dependency controls</legend>
    <button @click="emit('control', 'item-pricing')">
      Change Item price and options
    </button>
    <button @click="emit('control', 'reset-item-pricing')">
      Reset Item price and options
    </button>
    <button @click="emit('control', 'item-private')">
      Change private Item field
    </button>
    <button @click="emit('control', 'withdraw-special')">
      Withdraw special date
    </button>
    <button @click="emit('control', 'draft-special')">
      Unpublish special Menu
    </button>
    <button @click="emit('control', 'publish-special')">
      Restore published special
    </button>
    <button @click="emit('control', 'item-image')">Set local Item image</button>
    <button @click="emit('control', 'enable-item-images')">
      Enable Item images
    </button>
    <button @click="emit('control', 'disable-item-images')">
      Disable Item images
    </button>
    <button @click="emit('control', 'place-currency')">
      Change Place currency
    </button>
    <button @click="emit('control', 'reset-place-currency')">
      Reset Place currency
    </button>
  </fieldset>
</template>
<script setup lang="ts">
const emit = defineEmits<{ control: [operation: string] }>()
</script>
