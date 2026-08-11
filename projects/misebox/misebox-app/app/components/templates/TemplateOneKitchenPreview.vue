<template>
  <section
    class="template-one-kitchen-preview"
    aria-labelledby="template-one-kitchen-preview-title"
  >
    <div>
      <small>Inherited · Kitchen</small>
      <strong id="template-one-kitchen-preview-title">Kitchen preview</strong>
      <span>Place identity extended into a public menu doorway</span>
    </div>
    <article :style="{ backgroundColor: primaryColor }">
      <img
        v-if="identitySrc"
        :src="identitySrc"
        :alt="`${name} identity`"
      >
      <span v-else class="template-one-kitchen-preview__missing">
        Inherited identity media missing
      </span>
      <div>
        <strong>{{ name }}</strong>
        <span>Kitchen menu</span>
        <NuxtLink :to="`/kitchens/${slug}`">Browse menu</NuxtLink>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  primaryColor: string
  slug: string
  identitySrc?: string
}>()
</script>

<style scoped>
.template-one-kitchen-preview {
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 4);
  color: color-mix(in srgb, white 72%, transparent);
  background: #171716;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}
.template-one-kitchen-preview > div,
.template-one-kitchen-preview article > div {
  display: grid;
  gap: calc(var(--spacing) * 1);
}
.template-one-kitchen-preview small {
  color: color-mix(in srgb, white 46%, transparent);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
.template-one-kitchen-preview > div > strong {
  color: white;
}
.template-one-kitchen-preview > div > span {
  font-size: var(--text-xs);
}
.template-one-kitchen-preview article {
  display: grid;
  min-height: calc(var(--spacing) * 24);
  gap: calc(var(--spacing) * 5);
  align-content: center;
  padding: calc(var(--spacing) * 5);
  color: white;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: var(--ui-radius);
}
.template-one-kitchen-preview article img {
  display: block;
  width: min(100%, 18rem);
  max-height: calc(var(--spacing) * 12);
  object-fit: contain;
  object-position: left center;
}
.template-one-kitchen-preview__missing {
  color: color-mix(in srgb, white 68%, transparent) !important;
  letter-spacing: normal !important;
  text-transform: none !important;
}
.template-one-kitchen-preview article strong {
  font-size: clamp(var(--text-xl), 5vw, var(--text-3xl));
}
.template-one-kitchen-preview article div > span {
  color: color-mix(in srgb, white 62%, transparent);
  font-size: var(--text-sm);
}
.template-one-kitchen-preview article a {
  width: fit-content;
  margin-top: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 4);
  color: var(--template-kitchen-action-ink, #0b0b0a);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  background: white;
  border-radius: var(--ui-radius);
  text-decoration: none;
}
@media (min-width: 40.0625rem) {
  .template-one-kitchen-preview {
    grid-template-columns: minmax(12rem, 0.45fr) minmax(20rem, 1fr);
    align-items: center;
    padding-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
  }
  .template-one-kitchen-preview article {
    grid-template-columns: minmax(10rem, 1fr) auto;
    align-items: center;
  }
}
</style>
