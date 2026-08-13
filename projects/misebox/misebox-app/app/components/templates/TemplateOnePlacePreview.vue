<template>
  <section
    class="template-one-place-preview"
    aria-labelledby="template-one-place-preview-title"
  >
    <div>
      <small>Inherited · Place</small>
      <strong id="template-one-place-preview-title">Place preview</strong>
      <span>{{ source }}</span>
    </div>
    <figure :style="{ backgroundColor: primaryColor }">
      <img
        v-if="identitySrc"
        :src="identitySrc"
        :alt="`${name} identity`"
      >
      <figcaption v-else>
        <strong>{{ name }}</strong>
            <span>Identity media missing</span>
      </figcaption>
    </figure>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  primaryColor: string
  source: string
  identitySrc?: string
}>()
</script>

<style scoped>
.template-one-place-preview {
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 4);
  color: color-mix(in srgb, white 72%, transparent);
  background: #131312;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}
.template-one-place-preview > div {
  display: grid;
  gap: calc(var(--spacing) * 1);
}
.template-one-place-preview small {
  color: color-mix(in srgb, white 46%, transparent);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
.template-one-place-preview > div > strong {
  color: white;
}
.template-one-place-preview > div > span {
  font-size: var(--text-xs);
}
.template-one-place-preview figure {
  display: grid;
  min-height: calc(var(--spacing) * 24);
  place-items: center;
  margin: 0;
  padding: calc(var(--spacing) * 5);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: var(--ui-radius);
}
.template-one-place-preview img {
  display: block;
  width: min(100%, 20rem);
  max-height: calc(var(--spacing) * 14);
  object-fit: contain;
}
.template-one-place-preview figcaption {
  display: grid;
  gap: calc(var(--spacing) * 1);
  color: white;
  text-align: center;
}
.template-one-place-preview figcaption span {
  color: color-mix(in srgb, white 58%, transparent);
  font-size: var(--text-xs);
}
@media (min-width: 40.0625rem) {
  .template-one-place-preview {
    grid-template-columns: minmax(12rem, 0.45fr) minmax(20rem, 1fr);
    align-items: center;
    padding-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
  }
}
</style>
