# Copilot Notes for Package Development

## Important Steps for New Packages

1. **Prepare the Module**:

   - Run `npx nuxi prepare` or `pnpm nuxi prepare` to generate the `.nuxt` folder and type declarations.

2. **Verify TypeScript Configuration**:

   - Ensure `tsconfig.json` includes the `.nuxt` folder in the `include` array.

3. **Test in Isolation**:

   - Confirm the package works independently without relying on a consuming app.

4. **Shared Assets**:

   - Place shared assets in the `public/` directory for accessibility.

5. **Documentation**:
   - Update the `README.md` with usage instructions and setup steps.

---

This file serves as a reminder for best practices when creating new packages.
