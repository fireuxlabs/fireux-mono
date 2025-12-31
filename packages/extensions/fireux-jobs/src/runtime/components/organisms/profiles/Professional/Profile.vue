<template>
  <OrganismsProfilesProfessionalCardsProfile v-bind="$props" />
</template>

<script setup lang="ts">
defineProps<{
  professional?: any
}>()

type DurationInput = {
  fromMonth?: string | null
  fromYear?: string | null
  toMonth?: string | null
  toYear?: string | null
  ongoing?: boolean
}

</script>
