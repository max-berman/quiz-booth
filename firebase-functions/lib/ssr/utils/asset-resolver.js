"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAssetCache = exports.getResolvedAssets = exports.resolveAssetFiles = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Default asset file names - these are the patterns Vite typically generates
 * This serves as a fallback when file system access is not available
 */
const DEFAULT_ASSETS = {
    cssFile: 'index-juwbc9fD.css',
    jsFile: 'index-jo8DPBEf.js',
    vendorFiles: {
        react: 'vendor-react-C8w-UNLI.js',
        radix: 'vendor-radix-BDMsTCiy.js',
        query: 'vendor-query-CiE4Trht.js',
        charts: 'vendor-charts-BKXKzPuX.js',
        icons: 'vendor-icons-D3v8FN1e.js',
        forms: 'vendor-forms-DUAFrJ_w.js'
    }
};
/**
 * Scans the assets directory and resolves the actual file names
 * based on patterns. Falls back to defaults if file system access fails.
 */
function resolveAssetFiles() {
    try {
        const assetsDir = path.join(__dirname, '../../../../dist/public/assets');
        // Check if assets directory exists
        if (!fs.existsSync(assetsDir)) {
            console.warn('Assets directory not found, using default asset names');
            return DEFAULT_ASSETS;
        }
        const files = fs.readdirSync(assetsDir);
        // Find files by pattern
        const cssFile = files.find(file => file.startsWith('index-') && file.endsWith('.css'));
        const jsFile = files.find(file => file.startsWith('index-') && file.endsWith('.js'));
        const vendorReact = files.find(file => file.startsWith('vendor-react-') && file.endsWith('.js'));
        const vendorRadix = files.find(file => file.startsWith('vendor-radix-') && file.endsWith('.js'));
        const vendorQuery = files.find(file => file.startsWith('vendor-query-') && file.endsWith('.js'));
        const vendorCharts = files.find(file => file.startsWith('vendor-charts-') && file.endsWith('.js'));
        const vendorIcons = files.find(file => file.startsWith('vendor-icons-') && file.endsWith('.js'));
        const vendorForms = files.find(file => file.startsWith('vendor-forms-') && file.endsWith('.js'));
        // Use found files or fall back to defaults
        return {
            cssFile: cssFile || DEFAULT_ASSETS.cssFile,
            jsFile: jsFile || DEFAULT_ASSETS.jsFile,
            vendorFiles: {
                react: vendorReact || DEFAULT_ASSETS.vendorFiles.react,
                radix: vendorRadix || DEFAULT_ASSETS.vendorFiles.radix,
                query: vendorQuery || DEFAULT_ASSETS.vendorFiles.query,
                charts: vendorCharts || DEFAULT_ASSETS.vendorFiles.charts,
                icons: vendorIcons || DEFAULT_ASSETS.vendorFiles.icons,
                forms: vendorForms || DEFAULT_ASSETS.vendorFiles.forms
            }
        };
    }
    catch (error) {
        console.warn('Failed to resolve asset files, using defaults:', error instanceof Error ? error.message : String(error));
        return DEFAULT_ASSETS;
    }
}
exports.resolveAssetFiles = resolveAssetFiles;
/**
 * Cached resolved assets to avoid repeated file system operations
 */
let cachedAssets = null;
/**
 * Get resolved assets with caching
 */
function getResolvedAssets() {
    if (!cachedAssets) {
        cachedAssets = resolveAssetFiles();
    }
    return cachedAssets;
}
exports.getResolvedAssets = getResolvedAssets;
/**
 * Clear the cache (useful for testing or development)
 */
function clearAssetCache() {
    cachedAssets = null;
}
exports.clearAssetCache = clearAssetCache;
//# sourceMappingURL=asset-resolver.js.map