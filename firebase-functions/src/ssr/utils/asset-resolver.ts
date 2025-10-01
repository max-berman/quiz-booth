import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for resolved asset file names
 */
export interface ResolvedAssets {
  cssFile: string;
  jsFile: string;
  vendorFiles: {
    react: string;
    radix: string;
    query: string;
    charts: string;
    icons: string;
    forms: string;
  };
}

/**
 * Default asset file names - these are the patterns Vite typically generates
 * This serves as a fallback when file system access is not available
 */
const DEFAULT_ASSETS: ResolvedAssets = {
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
export function resolveAssetFiles(): ResolvedAssets {
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
  } catch (error) {
    console.warn('Failed to resolve asset files, using defaults:', error instanceof Error ? error.message : String(error));
    return DEFAULT_ASSETS;
  }
}

/**
 * Cached resolved assets to avoid repeated file system operations
 */
let cachedAssets: ResolvedAssets | null = null;

/**
 * Get resolved assets with caching
 */
export function getResolvedAssets(): ResolvedAssets {
  if (!cachedAssets) {
    cachedAssets = resolveAssetFiles();
  }
  return cachedAssets;
}

/**
 * Clear the cache (useful for testing or development)
 */
export function clearAssetCache(): void {
  cachedAssets = null;
}
