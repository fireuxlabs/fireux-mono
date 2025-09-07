"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFireuxConfig = void 0;
var kit_1 = require("@nuxt/kit");
var runtime_config_1 = require("./config/runtime-config");
var plugins_config_1 = require("./config/plugins-config");
var components_config_1 = require("./config/components-config");
var composables_config_1 = require("./config/composables-config");
var layouts_config_1 = require("./config/layouts-config");
var pages_config_1 = require("./config/pages-config");
var assets_config_1 = require("./config/assets-config");
var errors_config_1 = require("./config/errors-config");
var module = (0, kit_1.defineNuxtModule)({
    meta: { name: 'fireux-core', version: '1.0.0', configKey: 'fireuxCore' },
    setup: function (_options, nuxt) {
        var resolver = (0, kit_1.createResolver)(import.meta.url);
        (0, runtime_config_1.configureRuntime)(nuxt, 'core');
        (0, plugins_config_1.configurePlugins)(resolver);
        (0, components_config_1.configureComponents)(resolver);
        (0, composables_config_1.configureComposables)(resolver);
        (0, layouts_config_1.configureLayouts)(resolver, nuxt);
        (0, pages_config_1.configurePages)(resolver, nuxt);
        // configureServer(resolver) // toggle as needed
        (0, assets_config_1.configureAssets)(resolver, nuxt);
        (0, errors_config_1.configureErrors)(resolver, nuxt);
        nuxt.hook('ready', function () {
            console.log('fireux-core: module configured');
        });
    },
});
exports.default = module;
var fireux_config_1 = require("./runtime/utils/fireux-config");
Object.defineProperty(exports, "createFireuxConfig", { enumerable: true, get: function () { return fireux_config_1.createFireuxConfig; } });
