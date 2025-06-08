# README Template for New Packages

## Package Name

### Description

Provide a brief description of the package and its purpose.

### Installation

```bash
pnpm install <package-name>
```

### Usage

Provide examples of how to use the package.

### Development

1. **Prepare the Module**:

   - Run `npx nuxi prepare` or `pnpm nuxi prepare` to generate the `.nuxt` folder and type declarations.

2. **Verify TypeScript Configuration**:

   - Ensure `tsconfig.json` includes the `.nuxt` folder in the `include` array.

3. **Test in Isolation**:
   - Confirm the package works independently without relying on a consuming app.

### Contributing

Provide guidelines for contributing to the package.

### License

Specify the license for the package.
