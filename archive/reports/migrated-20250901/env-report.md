# Environment Report (masked)

This summarizes .env values for FireUX, MiseBox, and Niederhorn, with sensitive values masked.

## Summary

- All .env files present and loaded at app roots.
- Service account files referenced by GOOGLE_APPLICATION_CREDENTIALS exist.
- Several optional fields are empty (OPENAI_API_KEY, STRIPE_WEBHOOK_SECRET, some measurement IDs).

## FireUX App
- Path: projects/fireux/fireux-app/.env
- Domain: http://localhost:3000
- App: APP_ID=fireux-app, APP_NAME=FireUX App
- Firebase:
  - PROJECT_ID=fireux-2005
  - API_KEY=AIz*************LM4 (masked)
  - AUTH_DOMAIN=fireux-2005.firebaseapp.com
  - STORAGE_BUCKET=fireux-2005.firebasestorage.app
  - APP_ID=1:549***********ca79 (masked)
  - MEASUREMENT_ID=G-4R6XV8JJEP
  - GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json (exists)
- Stripe:
  - PUBLISHABLE=pk_live_51Qv************j5j7iM3 (masked)
  - SECRET=sk_live_51Qv************n3K1tR (masked)
  - WEBHOOK_SECRET=(empty)
- OpenAI:
  - OPENAI_API_KEY set (placeholder)
- Notes: TENANT_MODULE empty (optional).

## MiseBox App
- Path: projects/misebox/misebox-app/.env
- Domain: http://localhost:3009
- App: APP_ID=misebox-app, APP_NAME=MiseBox
- Firebase:
  - PROJECT_ID=misebox-78f9c
  - API_KEY=AIz*************wg6M (masked)
  - AUTH_DOMAIN=misebox-78f9c.firebaseapp.com
  - STORAGE_BUCKET=misebox-78f9c.appspot.com
  - APP_ID=1:102***********7011 (masked)
  - MEASUREMENT_ID=(empty)
  - GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-misebox/config/service-account.json (exists)
- Stripe:
  - PUBLISHABLE=pk_live_51Gt************FZuP (masked)
  - SECRET=sk_live_51Gt************put1b (masked)
  - WEBHOOK_SECRET=(empty)
- OpenAI: OPENAI_API_KEY (empty)

## Niederhorn App
- Path: projects/misebox/niederhorn/.env
- Domain: http://localhost:3002
- App: APP_ID=niederhorn, APP_NAME=Niederhorn
- Firebase:
  - PROJECT_ID=misebox-78f9c
  - API_KEY=AIz*************wg6M (masked)
  - AUTH_DOMAIN=misebox-78f9c.firebaseapp.com
  - STORAGE_BUCKET=misebox-78f9c.appspot.com
  - APP_ID=1:102***********7011 (masked)
  - MEASUREMENT_ID=(empty)
  - GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-misebox/config/service-account.json (exists)
- Stripe:
  - PUBLISHABLE=pk_live_51Gt************FZuP (masked)
  - SECRET=sk_live_51Gt************put1b (masked)
  - WEBHOOK_SECRET=(empty)
- OpenAI: OPENAI_API_KEY (empty)

## Checks
- .gitignore covers .env and service-account*.json (preventing accidental commits).
- Service account files present at:
  - packages/tenants/fireux-misebox/config/service-account.json
  - projects/fireux/fireux-app/config/service-account.json

## Gaps to fill
- Set OPENAI_API_KEY in MiseBox and Niederhorn.
- Set STRIPE_WEBHOOK_SECRET in all apps if webhooks are used.
- Optional: set Firebase MEASUREMENT_ID for MiseBox and Niederhorn if using Analytics.
- Optional: set TENANT_MODULE in FireUX if required by runtime.
