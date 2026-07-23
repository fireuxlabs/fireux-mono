<template>
  <section class="market-feed" aria-labelledby="market-feed-title">
    <div class="market-feed__heading">
      <p class="market-eyebrow">Was louft</p>
      <h2 id="market-feed-title">Futter</h2>
    </div>

    <article
      v-for="post in futterPosts"
      :key="post.id"
      class="market-feed-post"
    >
      <img
        :src="post.image"
        :alt="post.imageAlt"
        class="market-feed-post__image"
      >
      <div class="market-feed-post__body">
        <span class="market-feed-post__label">{{ post.label }}</span>
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { futterPosts } from '../../content/futter'
</script>
