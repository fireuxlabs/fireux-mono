# FireUX AI

Authority: Tier2 operational package docs  
Updated: 2026-05-11

`fireux-ai` provides a small server-only AI integration seam for FireUX apps.

It owns shared AI request/response contracts, server runtime config resolution, a task whitelist, and backend utilities for `generateText()` and `generateJson()`.

Initial runtime keys:

```env
FIREUX_AI_ENABLED=true
FIREUX_AI_PROVIDER=openai
FIREUX_AI_API_KEY=sk-...
FIREUX_AI_MODEL=gpt-4o-mini
FIREUX_AI_MODE=dev
```

The API key is server-only. Do not place it in `runtimeConfig.public`, Firestore, client code, screenshots, or committed files.
