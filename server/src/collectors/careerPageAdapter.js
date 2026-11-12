import { BaseSourceAdapter } from './baseAdapter.js';

export class CareerPageAdapter extends BaseSourceAdapter {
  constructor(sourceConfig = {}) {
    super({
      name: sourceConfig.name || 'Company Career Feed',
      type: 'CAREER_PAGE',
      baseUrl: sourceConfig.baseUrl || 'https://careers.example.com',
      ...sourceConfig
    });
  }

  async fetchJobs({ feedUrl } = {}) {
    const targetUrl = feedUrl || this.baseUrl;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const text = await res.text();
      return this.parseFeed(text, targetUrl);
    } catch {
      return [];
    }
  }

  parseFeed(feedText, sourceUrl) {
    // Basic RSS/JSON detection
    try {
      const json = JSON.parse(feedText);
      if (Array.isArray(json)) {
        return json.map((item, idx) => ({
          externalId: item.id || `feed-${idx}`,
          sourceType: 'CAREER_PAGE',
          companyName: item.company || 'Direct Employer',
          jobTitle: item.title || 'Software Engineer',
          location: item.location || 'Remote',
          applicationUrl: item.url || sourceUrl,
          sourceUrl,
          canonicalUrl: item.url || sourceUrl,
          postedAt: item.date ? new Date(item.date) : new Date(),
          description: item.description || '',
          rawPayload: item
        }));
      }
    } catch {
      // Return empty if not standard JSON feed
    }
    return [];
  }
}

