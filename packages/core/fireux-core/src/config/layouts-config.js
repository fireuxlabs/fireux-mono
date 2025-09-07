"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureLayouts = configureLayouts;
var kit_1 = require("@nuxt/kit");
var node_path_1 = require("node:path");
var node_fs_1 = require("node:fs");
/**
 * Configure layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
function configureLayouts(resolver, _nuxt) {
    var layoutsDir = resolver.resolve('./runtime/layouts');
    if (!(0, node_fs_1.existsSync)(layoutsDir))
        return;
    // Register as layout components (CoreDefault/CoreDashboard/CoreDev/CoreDocs/CoreDesign)
    (0, kit_1.addComponentsDir)({
        path: layoutsDir,
        pattern: '*.vue',
        prefix: 'Core',
        global: true,
        pathPrefix: false,
    });
    // Register layout keys that exist on disk
    // Note: We intentionally do NOT register 'default' here to avoid
    // layer key collisions with app-level app/layouts/default.vue.
    // Apps own their default.vue; core still exposes CoreDefault as a component.
    var keys = ['dashboard', 'dev', 'design', 'docs'];
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        var file = (0, node_path_1.join)(layoutsDir, "".concat(key, ".vue"));
        if ((0, node_fs_1.existsSync)(file)) {
            (0, kit_1.addLayout)({ src: file, filename: "fireux-core-".concat(key, ".vue") }, key);
        }
    }
}
