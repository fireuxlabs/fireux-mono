<template>
  <div class="job-index-artwork" aria-hidden="true">
    <img
      src="/img/jobs/people-at-work.jpg"
      alt=""
      width="1568"
      height="1003"
      fetchpriority="high"
    >
    <div class="job-index-artwork__grain" />
  </div>
</template>

<style scoped>
.job-index-artwork,
.job-index-artwork img,
.job-index-artwork__grain {
  height: 100%;
  inset: 0;
  position: absolute;
  width: 100%;
}

.job-index-artwork img {
  object-fit: cover;
  object-position: center;
}

.job-index-artwork__grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");
  mix-blend-mode: soft-light;
  opacity: 0.18;
}

@media (max-width: 40rem) {
  .job-index-artwork img {
    object-position: 61% center;
  }
}
</style>
