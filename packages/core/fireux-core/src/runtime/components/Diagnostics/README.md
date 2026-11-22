# Structured data inspection

[`FireDiagnosticsDebugPanel`](DebugPanel.vue) displays an explicitly supplied
[developer payload](../../types/dev-debug.ts). Use `objects` for source values
and `derived` for projections, counts, or interaction flags. Set `objectOrigin`
to `fetched` at the owner that reads the data and `passed` when a component
receives it. These are payload roles. The inspector does not acquire data.

Use authorized, bounded sources. Scope diagnostics to development or the
supported developer surface. Server handlers still check their own authority.
Omit credentials and private records from public data. Adding an inspector
does not justify a second read or an extra exposed field.
