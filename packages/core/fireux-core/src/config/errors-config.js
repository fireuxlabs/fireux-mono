"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureErrors = configureErrors;
var kit_1 = require("@nuxt/kit");
/**
 * Configure error handling for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
function configureErrors(_resolver, _nuxt) {
    // Provide a minimal centralized error page following Nuxt 4 defaults
    // Apps can override by creating their own error.vue
    (0, kit_1.addTemplate)({
        filename: 'error.vue',
        getContents: function () { return "<script setup lang=\"ts\">\n// Use a structural type to avoid importing from app-only aliases in server runtime\ntype Err = { statusCode?: number; statusMessage?: string }\n\nconst props = defineProps<{ error?: Err }>()\n\nconst handleError = () => clearError({ redirect: '/' })\n</script>\n\n<template>\n  <div class=\"cell error-page\">\n    <div class=\"cell-content\">\n  <h1 class=\"cell-title\">{{ error?.statusCode || 500 }}</h1>\n  <p class=\"cell-subtitle\">{{ error?.statusMessage || 'Something went wrong' }}</p>\n      <div class=\"cell-actions\">\n        <button @click=\"handleError\">Try again</button>\n        <a href=\"/\">Go home</a>\n      </div>\n    </div>\n  </div>\n</template>"; },
    });
}
