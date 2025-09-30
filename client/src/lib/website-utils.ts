// Common TLDs that are likely to be websites
export const commonTLDs = [
  '.com', '.org', '.net', '.io', '.co', '.dev', '.app', '.tech', '.ai', '.me',
  '.info', '.biz', '.us', '.uk', '.ca', '.au', '.de', '.fr', '.jp', '.cn',
  '.edu', '.gov', '.mil', '.xyz', '.online', '.site', '.store', '.blog',
  '.club', '.design', '.space', '.world', '.digital', '.cloud', '.tools'
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
