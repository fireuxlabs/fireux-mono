<template>
  <section :aria-label="title">
    <div>
      <div>
        <UIcon :name="icon" />
        <div>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
          <div>
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>
    <slot />
  </section>
</template>
<script setup lang="ts">
defineProps<{ title: string; description: string; icon: string }>()
</script>
