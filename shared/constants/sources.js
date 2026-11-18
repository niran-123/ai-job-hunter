export const SOURCE_TYPES = {
  GREENHOUSE: 'GREENHOUSE',
  LEVER: 'LEVER',
  LINKEDIN: 'LINKEDIN',
  CAREER_PAGE: 'CAREER_PAGE',
  API: 'API'
};

export const INITIAL_SOURCES = [
  {
    name: 'LinkedIn Live Feeds (TN & India)',
    type: 'LINKEDIN',
    baseUrl: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search',
    enabled: true,
    scanFrequencyMinutes: 30,
    rateLimitPerMinute: 60
  },
  {
    name: 'Greenhouse API',
    type: 'GREENHOUSE',
    baseUrl: 'https://boards-api.greenhouse.io/v1/boards',
    enabled: true,
    scanFrequencyMinutes: 30,
    rateLimitPerMinute: 60
  },
  {
    name: 'Lever Postings API',
    type: 'LEVER',
    baseUrl: 'https://api.lever.co/v0/postings',
    enabled: true,
    scanFrequencyMinutes: 30,
    rateLimitPerMinute: 60
  },
  {
    name: 'Official Tamil Nadu & India IT Portals',
    type: 'CAREER_PAGE',
    baseUrl: 'https://careers.zohocorp.com',
    enabled: true,
    scanFrequencyMinutes: 60,
    rateLimitPerMinute: 30
  }
];

export const INITIAL_COUNTRIES = [
  { code: 'IN', name: 'India', enabled: true },
  { code: 'US', name: 'United States', enabled: true },
  { code: 'CA', name: 'Canada', enabled: true },
  { code: 'GB', name: 'United Kingdom', enabled: true },
  { code: 'DE', name: 'Germany', enabled: true },
  { code: 'SG', name: 'Singapore', enabled: true },
  { code: 'AU', name: 'Australia', enabled: false },
  { code: 'IE', name: 'Ireland', enabled: false },
  { code: 'NL', name: 'Netherlands', enabled: false }
];

