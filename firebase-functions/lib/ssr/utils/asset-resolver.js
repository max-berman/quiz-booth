"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolvedAssets = void 0;
/**
 * Current asset file names - these must be updated after each build
 * to match the actual generated file names
 */
const CURRENT_ASSETS = {
    cssFile: 'index-Bx38nndp.css',
    jsFile: 'index-HrLKrtAn.js',
    vendorFiles: {
        react: 'vendor-react-C8w-UNLI.js',
        radix: 'vendor-radix-BDMsTCiy.js',
        query: 'vendor-query-CiE4Trht.js',
        charts: 'vendor-charts-BKXKzPuX.js',
        icons: 'vendor-icons-DXbOlbHJ.js',
        forms: 'vendor-forms-DUAFrJ_w.js'
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