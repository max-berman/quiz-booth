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
  cssFile: 'index-CoieYAlj.css',
  jsFile: 'index-CKC9Za2P.js',
  vendorFiles: {
    react: 'vendor-react-C8w-UNLI.js',
    radix: 'vendor-radix-DVK6rLv8.js',
    query: 'vendor-query-DIWBT0ED.js',
    charts: 'vendor-charts-BybkUXTr.js',
    icons: 'vendor-icons-_mPLIzkG.js',
    forms: 'vendor-forms-pX7iQRS_.js'
  }
};

/**
 * Generate deployment hash based on current asset file names
 * This ensures functions are redeployed when assets change
 */
function generateDeploymentHash(assets: ResolvedAssets): string {
  const assetString = JSON.stringify(assets);
  // Simple hash function to create a unique identifier
  let hash = 0;
  for (let i = 0; i < assetString.length; i++) {
    const char = assetString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export const DEPLOYMENT_HASH = generateDeploymentHash(CURRENT_ASSETS);

/**
 * Get resolved assets
 * Note: In production, we cannot access the file system from Firebase Functions,
 * so we rely on manually updating the CURRENT_ASSETS object after each build
 */
export function getResolvedAssets(): ResolvedAssets {
  return CURRENT_ASSETS;
}
