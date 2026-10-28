# FireUX Demo

Updated: 2026-10-28
Ref: cf2413355
Role: package router, not canon

`fireux-demo` owns cross-domain, fictional Demo World contracts that do not
belong in FireUX Core or any one domain extension. It is explicit-import-only:
installing the Nuxt module registers no runtime surface.

Current scope is the immutable Misebox Demo media URL contract. Kitchens,
Suppliers and their linked Company/Place fixtures consume that one contract.
Firebase Storage remains image authority; this package does not publish media.

Start at `AGENTS.md`, `docs/ai/gpt-context.md`, and
`docs/concepts/demo-data.md`.
