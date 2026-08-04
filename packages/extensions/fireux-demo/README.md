# FireUX Demo

Updated: 2026-08-04
Ref: d232cc731
Role: package router, not canon

`fireux-demo` owns cross-domain, fictional Demo World contracts that do not
belong in FireUX Core or any one domain extension. It is explicit-import-only:
installing the Nuxt module registers no runtime surface.

Current scope is the immutable Misebox Demo media URL contract. Kitchens,
Suppliers, Companies, project fixtures, guards, and the create-only publisher
consume that one contract; Firebase Storage remains image authority.

Start at `AGENTS.md`, `docs/ai/gpt-context.md`, and
`docs/concepts/demo-data.md`.
