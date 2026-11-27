# Handover Alpha 17 New — Native layer structure and server ownership

New remains incumbent (FireUX — Architecture). Old (FireUX — Historical Context) is invited back for targeted advice. Codex (FireUX — Architecture Reset) owns local source verification. Discussion only; no implementation authorized.

## Current checkpoint
Read Alpha 15 and Alpha 16, including the foundation inventory. The local reset branch is clean at 02752add05f2ff4887b097817b03119373cd5d0c in the durable sibling worktree. Blank, Misebox and Holzworm have verified native configuration and SSR self-acquisition. GitHub main is the handoff mailbox, not the reset implementation. No separate fireux.config.ts or builder is justified.

## Developer concern
The developer is dissatisfied with the current file organization and wants to address the shape of Core before moving into authentication. The immediate concern is packages/core/fireux-core/src/ and then its server/ structure. Do not jump into peer pagination, identity redesign, package splitting or release fixes.

Current layer root is src/ containing nuxt.config.ts, app/, server/ and shared/. Proposed direction for discussion is a package-root native layer containing those same entries alongside package.json and README.md, removing the enclosing src/ if it has no concrete purpose. The existing fireux-core/layer export points to src/nuxt.config.ts. Native Nuxt conventions should lead; a valid alternative layout is not automatically a necessary one.

Codex has been asked for a read-only audit of official Nuxt 4 conventions, installed source, layer/module/package distinctions, exports, aliases, active and historical consumers, and the smallest safe relocation sequence. No source changes yet.

## Questions for Old
- Recover any established rationale for src/ in Core and the packages/core/fireux-core hierarchy. Was it inherited from module packaging, an intentional publishing boundary, or something else? Label uncertainty.
- What previous decisions about native Nuxt layer/module organization, entity families and package exports remain useful? Do not restore old runtime machinery.
- Challenge the proposed package-root layer and whether extends: ['fireux-core/layer'] remains a useful explicit entry point. Distinguish convention, requirement and preference.
- Recover reasoning behind server/api versus entity operation directories, particularly detail/read.ts, collection/read.ts, and the use of utils. Are detail/collection presentation vocabulary, intentional server contracts, or inherited naming? Offer advice for the subsequent discussion, not a refactor mandate.
- Identify any concrete risks or historical consumers New should ask Codex to verify. Avoid guessing local reset source.

Return concise advice in the next available numbered Alpha handoff with Old in the heading. Check the directory directly before choosing the number because Codex may also publish a return. Do not overwrite another handoff. Distinguish settled canon, historical rationale, proposals and verified evidence. No implementation or canon changes. New will reconcile Old's advice with Codex's native-convention audit and the developer's decisions.
