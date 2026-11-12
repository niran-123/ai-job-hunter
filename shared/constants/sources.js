export const SOURCE_TYPES = {
  GREENHOUSE: 'GREENHOUSE',
  LEVER: 'LEVER',
  CAREER_PAGE: 'CAREER_PAGE',
  API: 'API'
};

export const INITIAL_SOURCES = [
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
    name: 'Official Company Career Feeds',
    type: 'CAREER_PAGE',
    baseUrl: 'https://example.com/careers',
    enabled: true,
    scanFrequencyMinutes: 240,
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

