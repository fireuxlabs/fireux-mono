# Configuration

- Single entry: createFireuxConfig for all apps
- Ports set via dev scripts; no server.port in nuxt.config
- Root tsconfig: baseUrl "."; packages are noEmit (source-first)
- Firebase config via runtimeConfig.public.firebaseConfig (surface in dev opt-in)

## Auth/Firebase ordering
- Initialize vuefire/nuxt-vuefire before core plugin; avoid double init