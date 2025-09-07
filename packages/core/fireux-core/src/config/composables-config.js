"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureComposables = configureComposables;
var kit_1 = require("@nuxt/kit");
function configureComposables(resolver) {
    (0, kit_1.addImportsDir)(resolver.resolve('./runtime/composables'));
    (0, kit_1.addImportsDir)(resolver.resolve('./runtime/composables/**'));
}
