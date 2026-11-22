# fireux-core

Shared FireUX foundations and Nuxt integration. Product domains belong to their
owning Extension or Ecosystem packages; concrete Apps own deployment and branding.

## Package root

```text
fireux-core/
├── src/                 # Authored package source
├── build/               # Production configuration compiler
├── build.config.ts      # Module-builder hook
├── package.json         # Package identity, dependencies, exports and commands
├── tsconfig.json        # Package type checking
└── README.md            # Package entrypoints and commands
```

`.nuxt/`, `dist/` and `node_modules/` are ignored generated or installed content.
Package identity and metadata live in `package.json`.

## Entry points

- [Source map](src/README.md) leads to Core's configuration, runtime and tests.
- [Nuxt module](src/module.ts) is exported as `fireux-core`.
- [Native Nuxt layer](src/runtime/nuxt.config.ts) is exported as `fireux-core/layer`.
- [Package manifest](package.json) defines the public exports and dependencies.

Production configuration exports resolve to compiled files under `dist/`.
`build/config.mjs` compiles those files and their required local dependencies.
Both the module-builder hook and `prepack` invoke that compiler.

## Commands

Run from this package directory:

- `pnpm build`: build the module and production configuration exports.
- `pnpm dev`: generate module development stubs.
- `pnpm exec tsc --noEmit`: check package types.
- `pnpm clean`: remove generated `dist/` output.

Follow the [repo working rules](../../../AGENTS.md). Use the
[runtime package map](../../../docs/concepts/runtime-package.md) for questions
about package installation and registration.
