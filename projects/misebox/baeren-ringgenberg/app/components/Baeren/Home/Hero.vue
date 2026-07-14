<template>
  <section class="baeren-scroll-demo">
    <div class="baeren-scroll-demo__photo" aria-hidden="true" />

    <div class="baeren-scroll-demo__track">
      <h1 class="baeren-scroll-demo__heading">
        Hotel Bären Ringgenberg
      </h1>

      <div class="baeren-scroll-demo__placeholder">
        Placeholder element 2
      </div>

      <div class="baeren-scroll-demo__placeholder">
        Placeholder element 3
      </div>

      <div class="baeren-scroll-demo__placeholder">
        Placeholder element 4
      </div>
    </div>
  </section>
</template>

<style scoped>
.baeren-scroll-demo {
  position: relative;
  width: 100vw;
  min-height: 500svh;
  margin-block-start: calc(var(--spacing-m) * -1);
  margin-inline-start: calc(50% - 50vw);
}

.baeren-scroll-demo__photo {
  position: sticky;
  top: 0;
  height: 100svh;
  background-image: url('/img/app/background.png');
  background-position: center;
  background-size: cover;
}

.baeren-scroll-demo__track {
  position: absolute;
  inset-inline: 0;
  top: 110svh;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 60svh;
  padding-inline: max(1rem, calc((100vw - 80rem) / 2));
}

.baeren-scroll-demo__heading {
  max-width: 16ch;
  color: white;
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-shadow: 0 0.2rem 1.5rem rgb(0 0 0 / 70%);
}

.baeren-scroll-demo__placeholder {
  display: grid;
  width: min(28rem, calc(100vw - 2rem));
  min-height: 14rem;
  place-items: center;
  border: 2px dashed rgb(255 255 255 / 70%);
  border-radius: 1.5rem;
  background: rgb(15 23 42 / 24%);
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  text-shadow: 0 0.1rem 0.75rem rgb(0 0 0 / 70%);
}
</style>
