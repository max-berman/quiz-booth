"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolvedAssets = void 0;
/**
 * Current asset file names - these must be updated after each build
 * to match the actual generated file names
 */
const CURRENT_ASSETS = {
    cssFile: 'index-Bgbe2GQi.css',
    jsFile: 'index-TNabJ5o-.js',
    vendorFiles: {
        react: 'vendor-react-C8w-UNLI.js',
        radix: 'vendor-radix-DVK6rLv8.js',
        query: 'vendor-query-DIWBT0ED.js',
        charts: 'vendor-charts-BybkUXTr.js',
        icons: 'vendor-icons-lCX8gI2t.js',
        forms: 'vendor-forms-pX7iQRS_.js'
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