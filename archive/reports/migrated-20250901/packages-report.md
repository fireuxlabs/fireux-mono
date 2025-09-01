# Packages Report

Summarizes standardized manifests under packages/*/* after src-first normalization.

| package | main | types | export["."] | export["./runtime/*"] | files | scripts (build/dev/postbuild/clean) | engines | deps | peerDeps | devDeps |
|---|---|---|---|---|---|---|---|---|---|---|
| fireux-core | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | src/**/* | yes | yes | dompurify | nuxt, @nuxt/kit, @nuxt/schema, vue, vue-router, vuefire, firebase, firebase-admin, h3, stripe, glob, @vueuse/core | @nuxt/module-builder, rimraf |
| fireux-jobs | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | src/**/* | yes | yes | fireux-core | nuxt, @nuxt/kit, @nuxt/schema, vue, vue-router, vuefire, firebase, firebase-admin, h3, stripe, glob, @vueuse/core | @nuxt/module-builder, rimraf |
| fireux-places | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | src/**/* | yes | yes | fireux-core | nuxt, @nuxt/kit, @nuxt/schema, vue, vue-router, vuefire, firebase, firebase-admin, h3, stripe, glob, @vueuse/core | @nuxt/module-builder, rimraf |
| fireux-cleanbox | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | src/**/* | yes | yes | fireux-core | nuxt, @nuxt/kit, @nuxt/schema, vue, vue-router, vuefire, firebase, firebase-admin, h3, stripe, glob, @vueuse/core | @nuxt/module-builder, rimraf |
| fireux-misebox | ./src/module.ts | ./src/module.ts | ./src/module.ts | ./src/runtime/* | src/**/* | yes | yes | fireux-core, fireux-places | nuxt, @nuxt/kit, @nuxt/schema, vue, vue-router, vuefire, firebase, firebase-admin, h3, stripe, glob, @vueuse/core | @nuxt/module-builder, rimraf |

JSON lint: OK
