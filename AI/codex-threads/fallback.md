# Fallback Policy

Updated: 2026-02-28
Fallbacks are prohibited unless explicitly requested by a human.

Why:
- Silent fallbacks can hide holes and cause incorrect state selection.
- AI systems tend to fill gaps; humans must decide when and how to fill them.

Rules:
- Do not introduce fallback logic, default selection, or silent substitution.
- Require explicit user choice for selection and routing decisions.
- If data is missing, surface it clearly and stop rather than infer.

Applies to all AI-assisted changes in this repo.

#end
