"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePlugins = configurePlugins;
var kit_1 = require("@nuxt/kit");
function configurePlugins(resolver) {
    // Client/runtime plugin example; add more as needed
    var maybeClient = resolver.resolve('./runtime/plugins/firebase.client.ts');
    (0, kit_1.addPlugin)({ src: maybeClient, mode: 'client' });
}
