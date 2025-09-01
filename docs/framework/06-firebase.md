# Firebase

Firebase 11.x, vuefire 3.x, nuxt-vuefire ^1.x
Auth pattern: const { appUser } = await useAppUser() in layouts
Collections are app-scoped (e.g., chefs, suppliers)
UID used as document IDs; validate data before writes

Troubleshooting:
auth/already-initialized → fix module order; avoid re-init in plugins