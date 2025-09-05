<template>
  <div class="landing-effect">
    <div
      v-for="n in particleCount"
      :key="n"
      class="effect-particle"
      :class="effectClass"
    >
      <!-- For code particles, add content -->
      <span v-if="effectType === 'code'" class="code-symbol">{{
        getRandomSymbol()
      }}</span>
    </div>
  </div>
</template>

<script setup>
// Use runtimeConfig so this works in server-render without importing #build/app.config
const runtimeConfig = useRuntimeConfig()
const { initializeEffect } = useLandingEffect()

// Map effect type based on primary color
const effectType = computed(() => {
  const primaryColor =
    runtimeConfig.public?.primaryColor /* from fireux createFireuxConfig */ ||
    'yellow'
  switch (primaryColor) {
    case 'green':
      return 'bubbles'
    case 'blue':
      return 'steam'
    case 'yellow':
      return 'code'
    default:
      return 'stars'
  }
})

// Particle count based on effect type
const particleCount = computed(() => {
  switch (effectType.value) {
    case 'bubbles':
      return 20
    case 'steam':
      return 15
    case 'code':
      return 25
    default:
      return 50
  }
})

// Class based on effect type
const effectClass = computed(() => {
  switch (effectType.value) {
    case 'bubbles':
      return 'bubble-particle'
    case 'steam':
      return 'steam-particle'
    case 'code':
      return 'code-particle'
    default:
      return 'star-particle'
  }
})

// Code symbols for FireUX
const codeSymbols = [
  '<',
  '>',
  '{',
  '}',
  '(',
  ')',
  '[',
  ']',
  '=',
  '+',
  '-',
  '*',
  '/',
  ';',
  ':',
  '.',
  ',',
  '!',
  '?',
  '#',
  '$',
  '%',
  '&',
]
const getRandomSymbol = () =>
  codeSymbols[Math.floor(Math.random() * codeSymbols.length)]

onMounted(() => {
  initializeEffect(effectType.value)
})
</script>

<style scoped>
.landing-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.effect-particle {
  position: absolute;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-fill-mode: none;
}

/* Star particles */
.star-particle {
  background: var(--color-primary-500);
  border-radius: 50%;
  animation-name: twinkle, moveUp;
  animation-direction: alternate, normal;
  animation-timing-function: ease, linear;
}

/* Bubble particles */
.bubble-particle {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(34, 197, 94, 0.3) 0%,
    rgba(34, 197, 94, 0.2) 30%,
    rgba(34, 197, 94, 0.1) 70%,
    transparent 100%
  );
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 50%;
  animation-name: pop, floatUp, sway;
  animation-direction: alternate, normal, alternate;
  animation-timing-function: ease-in-out, linear, ease-in-out;
}

/* Steam particles */
.steam-particle {
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.4) 0%,
    rgba(147, 197, 253, 0.3) 40%,
    rgba(186, 230, 253, 0.2) 70%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(2px);
  animation-name: expand, riseUp, drift;
  animation-direction: alternate, normal, alternate;
  animation-timing-function: ease-out, ease-in, ease-in-out;
}

/* Code particles */
.code-particle {
  color: var(--color-primary-500);
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-shadow: 0 0 10px var(--color-primary-300);
  animation-name: glow, codeRise, codeDrift;
  animation-direction: alternate, normal, alternate;
  animation-timing-function: ease-in-out, ease-in, ease-in-out;
}

.code-symbol {
  display: block;
}

/* Star animations */
@keyframes twinkle {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

@keyframes moveUp {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh);
  }
}

/* Bubble animations */
@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh);
  }
}

@keyframes sway {
  0% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(10px);
  }
}

/* Steam animations */
@keyframes expand {
  0% {
    transform: scale(0.5);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0.1;
  }
}

@keyframes riseUp {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh);
  }
}

@keyframes drift {
  0% {
    transform: translateX(-20px) rotate(-2deg);
  }
  50% {
    transform: translateX(15px) rotate(1deg);
  }
  100% {
    transform: translateX(-10px) rotate(-1deg);
  }
}

/* Code animations */
@keyframes glow {
  0% {
    opacity: 0.3;
    text-shadow: 0 0 5px var(--color-primary-300);
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 15px var(--color-primary-400);
  }
  100% {
    opacity: 0.4;
    text-shadow: 0 0 8px var(--color-primary-300);
  }
}

@keyframes codeRise {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh);
  }
}

@keyframes codeDrift {
  0% {
    transform: translateX(-15px) rotate(-1deg);
  }
  100% {
    transform: translateX(15px) rotate(1deg);
  }
}
</style>
