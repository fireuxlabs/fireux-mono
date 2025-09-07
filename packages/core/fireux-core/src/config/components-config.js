"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureComponents = configureComponents;
var kit_1 = require("@nuxt/kit");
function configureComponents(resolver) {
    (0, kit_1.addComponentsDir)({
        path: resolver.resolve('./runtime/components'),
        pattern: '**/*.vue', // include nested directories
        // No global prefix; rely on pathPrefix and directory structure
        global: true, // always available
        pathPrefix: true, // include folder structure in names
    });
}
