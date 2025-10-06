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
  cssFile: 'index-dzy7fEk5.css',
  jsFile: 'index-COpzhpvI.js',
  vendorFiles: {
    react: 'vendor-react-C8w-UNLI.js',
    radix: 'vendor-radix-Bc0FetqD.js',
    query: 'vendor-query-DzEs-1cG.js',
    charts: 'vendor-charts-Bo6bkFXk.js',
    icons: 'vendor-icons-BIWDsoQv.js',
    forms: 'vendor-forms-ZEB_K3z5.js'
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
