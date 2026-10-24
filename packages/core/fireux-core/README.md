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

- `src/module.ts`, exported as `fireux-core`: Nuxt module registration.
- `src/runtime/nuxt.config.ts`, exported as `fireux-core/layer`: native runtime layer.
- `src/config/app/`: App configuration exports; see `package.json` for public paths.
- `src/config/module/`: module configuration exports.
- `src/runtime/`: Nuxt entrypoints plus the Core-owned `app/`, `ecosystem/`,
  `user/` and `workspace/` implementations. Each named owner contains its own
  technical roles; root components/composables serve genuinely shared mechanisms.
- `src/types/`: public package types.

Production configuration exports resolve to compiled files under `dist/`.
`build/config.mjs` compiles those files and their required local dependencies.
Both the module-builder hook and `prepack` invoke that compiler.

## Commands

Run from this package directory:

- `pnpm build`: build the module and production configuration exports.
- `pnpm dev`: generate module development stubs.
- `pnpm exec tsc --noEmit`: check package types.
- `pnpm clean`: remove generated `dist/` output.

For ownership and working conventions, start with the repository
[AGENTS.md](../../../AGENTS.md), [global context](../../../docs/ai/gpt-context.md)
and [runtime package map](../../../docs/concepts/runtime-package.md).
