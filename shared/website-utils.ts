// Shared website utilities for both client and server

// Common TLDs that are likely to be websites
export const commonTLDs = [
  // Classic and legacy TLDs
  '.com', '.net', '.org', '.info', '.biz', '.edu', '.gov', '.mil',
  // Tech & startup favorites
  '.io', '.ai', '.co', '.dev', '.app', '.tech', '.cloud', '.tools', '.digital', '.xyz',
  // General commercial & creative
  '.site', '.online', '.store', '.blog', '.shop', '.design', '.space', '.world', '.club', '.studio', '.media', '.live', '.solutions', '.agency', '.works', '.company',
  // Geographic & national
  '.us', '.uk', '.ca', '.au', '.de', '.fr', '.cn', '.jp', '.in', '.nl', '.br', '.it', '.es', '.ru',
  // New and notable TLDs (ccTLDs also used globally)
  '.me', '.tv', '.cc', '.to', '.gg', '.fm', '.ly', '.ws', '.io', '.ai',
  // Industry and niche
  '.finance', '.law', '.legal', '.consulting', '.health', '.care', '.clinic', '.hospital', '.pharmacy', '.eco', '.energy', '.solar', '.green',
  // E-commerce & business
  '.buy', '.sale', '.shop', '.market', '.marketing', '.business', '.money', '.finance', '.cash', '.fund', '.capital', '.investments', '.ventures',
  // Creative & lifestyle
  '.art', '.photo', '.photography', '.gallery', '.fashion', '.music', '.films', '.movie', '.games', '.game', '.fun', '.play', '.video', '.studio', '.stream',
  // Educational & informational
  '.academy', '.school', '.college', '.university', '.training', '.courses', '.education', '.news', '.press', '.wiki', '.review',
  // Localized & geo TLDs
  '.africa', '.london', '.paris', '.nyc', '.berlin', '.tokyo', '.madrid', '.sydney', '.melbourne', '.dubai',
  // Miscellaneous and trendy
  '.top', '.wow', '.vip', '.pro', '.name', '.page', '.site', '.world', '.zone', '.today', '.global', '.one', '.win', '.cool', '.club', '.link'
];

// Helper function to check if company name is a website
export function isWebsite(text: string): boolean {
  if (!text.includes('.')) return false;
  if (text.startsWith('http://') || text.startsWith('https://')) return true;

  return commonTLDs.some((tld) => {
    const index = text.indexOf(tld);
    if (index === -1) return false;
    const afterTLD = text.substring(index + tld.length);
    const beforeTLD = text.substring(0, index);

    const isValidPosition =
      afterTLD.length === 0 ||
      afterTLD.startsWith('/') ||
      afterTLD.startsWith('?') ||
      afterTLD.startsWith('#') ||
      afterTLD.startsWith('.');

    const hasDomainName = beforeTLD.length > 0;

    return isValidPosition && hasDomainName;
  });
}

// Format website for display
export function formatWebsite(website: string): string {
  try {
    const url = new URL(
      website.startsWith('http') ? website : `https://${website}`
    );
    return url.hostname;
  } catch {
    return website;
  }
}
