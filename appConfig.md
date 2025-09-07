# App app.config.ts comparison

This report compares the app-level `app/app.config.ts` across all apps.

## Summary

- fireux (tennant): primary=blue, neutral=zinc
- fireux (fireux-app): primary=blue, neutral=zinc
- fireux (tennant): primary=blue, neutral=zinc
- misebox (misebox-app): primary=green, neutral=slate
- misebox (niederhorn): primary=violet, neutral=zinc
- cleanbox (cleanbox-app): primary=blue, neutral=slate
- cleanbox (richies-reinigung): primary=blue, neutral=slate

## Details

### projects/fireux/tennant/app/app.config.ts

```ts
declare const defineAppConfig: (config: any) => any
export default defineAppConfig({
  ui: { colors: { primary: 'blue', neutral: 'zinc' } },
})
```

### projects/misebox/misebox-app/app/app.config.ts

```ts
declare const defineAppConfig: (config: any) => any
export default defineAppConfig({
  ui: { colors: { primary: 'green', neutral: 'slate' } },
})
```

### projects/misebox/niederhorn/app/app.config.ts

```ts
declare const defineAppConfig: (config: any) => any
export default defineAppConfig({
  ui: { colors: { primary: 'violet', neutral: 'zinc' } },
})
```

### projects/fireux/fireux-app/app/app.config.ts
```ts
declare const defineAppConfig: (config: any) => any
export default defineAppConfig({
  ui: { colors: { primary: 'blue', neutral: 'zinc' } }
})
```

### projects/cleanbox/cleanbox-app/app/app.config.ts

```ts
declare const defineAppConfig: (config: any) => any
export default defineAppConfig({
  ui: { colors: { primary: 'blue', neutral: 'slate' } },
})
```

### projects/cleanbox/richies-reinigung/app/app.config.ts

```ts
declare const defineAppConfig: (config: any) => any
export default defineAppConfig({
  ui: { colors: { primary: 'blue', neutral: 'slate' } },
})
```

## Notes

- These files only affect client UI theme tokens. They should not be imported in server code.
- We already wrap sensitive layouts with `ClientOnly` to avoid server evaluation of app-only aliases.
