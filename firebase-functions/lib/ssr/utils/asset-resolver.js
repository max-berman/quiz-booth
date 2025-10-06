"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolvedAssets = void 0;
/**
 * Current asset file names - these must be updated after each build
 * to match the actual generated file names
 */
const CURRENT_ASSETS = {
    cssFile: 'index-Dw0xkA0v.css',
    jsFile: 'index-CQHxAlk8.js',
    vendorFiles: {
        react: 'vendor-react-C8w-UNLI.js',
        radix: 'vendor-radix-Bc0FetqD.js',
        query: 'vendor-query-DzEs-1cG.js',
        charts: 'vendor-charts-Bo6bkFXk.js',
        icons: 'vendor-icons-9on4ZGI6.js',
        forms: 'vendor-forms-ZEB_K3z5.js'
    }
};
/**
 * Get resolved assets
 * Note: In production, we cannot access the file system from Firebase Functions,
 * so we rely on manually updating the CURRENT_ASSETS object after each build
 */
function getResolvedAssets() {
    return CURRENT_ASSETS;
}
exports.getResolvedAssets = getResolvedAssets;
//# sourceMappingURL=asset-resolver.js.map