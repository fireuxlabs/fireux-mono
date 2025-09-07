"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRuntime = configureRuntime;
/**
 * Ensure a stable namespace at runtimeConfig.public.fireux[key]
 * Used by fireux-core/module.ts during setup.
 */
function configureRuntime(nuxt, key, defaults) {
    var _a;
    if (defaults === void 0) { defaults = { enabled: true }; }
    // Work with a lenient view of runtimeConfig to avoid strict typing pitfalls
    var rc = nuxt.options.runtimeConfig;
    // Ensure public exists and satisfies modules that narrow types (e.g., @nuxtjs/mdc)
    rc.public || (rc.public = {});
    (_a = rc.public).mdc || (_a.mdc = {});
    var pub = rc.public;
    // Bucket under public.fireux
    if (!pub.fireux)
        pub.fireux = {};
    var fireux = pub.fireux;
    // Merge defaults into this namespace (don’t overwrite existing)
    fireux[key] = __assign(__assign({}, (fireux[key] || {})), defaults);
}
