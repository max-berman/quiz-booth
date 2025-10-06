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
 * Current asset file names - these must be updated after each build
 * to match the actual generated file names
 */
const CURRENT_ASSETS: ResolvedAssets = {
  cssFile: 'index-BMvdaoxI.css',
  jsFile: 'index-wishXcmu.js',
  vendorFiles: {
    react: 'vendor-react-C8w-UNLI.js',
    radix: 'vendor-radix-CtIS3uZQ.js',
    query: 'vendor-query-CtO4k8ZD.js',
    charts: 'vendor-charts-C96dEXy9.js',
    icons: 'vendor-icons-BxfxEJUM.js',
    forms: 'vendor-forms-DNNZqBgj.js'
  }
};

/**
 * Get resolved assets
 * Note: In production, we cannot access the file system from Firebase Functions,
 * so we rely on manually updating the CURRENT_ASSETS object after each build
 */
export function getResolvedAssets(): ResolvedAssets {
  return CURRENT_ASSETS;
}
