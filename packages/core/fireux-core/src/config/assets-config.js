"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAssets = configureAssets;
/**
 * Configure public assets for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
function configureAssets(resolver, nuxt) {
    var _a, _b, _c;
    var resolvePath = function (p) { return resolver.resolve(p); };
    // Add CSS files to Nuxt automatically
    nuxt.options || (nuxt.options = {});
    if (!nuxt.options.css)
        nuxt.options.css = [];
    var css = nuxt.options.css;
    var mainCssPath = resolvePath('./runtime/assets/styles/main.css');
    var mainScssPath = resolvePath('./runtime/assets/styles/scss/main.scss');
    // Ensure Tailwind/NUXT UI base first (main.css)
    if (!css.some(function (s) { return String(s).includes('runtime/assets/styles/main.css'); })) {
        css.push(mainCssPath);
    }
    // Then FireUX SCSS system
    if (!css.some(function (s) { return String(s).includes('runtime/assets/styles/scss/main.scss'); })) {
        css.push(mainScssPath);
    }
    // Configure Nitro to serve public assets from the package
    (_a = nuxt.options).nitro || (_a.nitro = {});
    (_b = nuxt.options.nitro).publicAssets || (_b.publicAssets = []);
    nuxt.options.nitro.publicAssets.push({
        baseURL: '/',
        dir: resolvePath('./runtime/public'),
        maxAge: 60 * 60 * 24 * 7, // 7 days cache
    });
    // Expose public directory and assets directory for advanced usage
    (_c = nuxt.options).alias || (_c.alias = {});
    nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public');
    nuxt.options.alias['#fireux-core-assets'] = resolvePath('./runtime/assets');
}
