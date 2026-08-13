<template>
  <TemplateOneProcessScene
    eyebrow="Our method"
    title="Three steps. One proper fry."
    :steps="steps"
    :palette="palette"
    data-friiites-scene="process"
  />
</template>

<script setup lang="ts">
import TemplateOneProcessScene from 'fireux-misebox/runtime/TemplateOneProcessScene.vue'

const palette = {
  primary_color: '#d99a22',
  secondary_color: '#f3e9d2',
} as const

const steps = [
  {
    title: 'Hand-cut',
    body: 'Local potatoes are pressed through a manual potato cutter with their skins on.',
  },
  {
    title: 'Brined overnight',
    body: 'The cut potatoes rest in brine overnight.',
  },
  {
    title: 'Triple-fried',
    body: 'They are fried three times in beef tallow.',
  },
] as const
</script>
